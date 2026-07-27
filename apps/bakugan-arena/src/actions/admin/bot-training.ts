'use server'

import { requireAdmin } from "@/src/actions/getUserSession"
import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq, inArray } from "drizzle-orm"

export async function listTrainingReplays() {
  await requireAdmin()

  return db.query.replay.findMany({
    columns: {
      id: true,
      roomId: true,
      title: true,
      createdAt: true,
    },
    with: {
      room: {
        columns: {
          winner: true,
          looser: true,
          player1Id: true,
          player2Id: true,
          ranked: true,
          finished: true,
        },
      },
    },
    orderBy: (replay, { desc: d }) => [d(replay.createdAt)],
  })
}

export async function listBotTrainingItems() {
  await requireAdmin()

  return db.query.botTrainingItem.findMany({
    orderBy: (item, { desc: d }) => [d(item.createdAt)],
    columns: {
      id: true,
      title: true,
      source: true,
      replayId: true,
      roomId: true,
      learnFromUserId: true,
      createdAt: true,
    },
  })
}

export async function listBotWeightVersions() {
  await requireAdmin()

  return db.query.botScoreWeights.findMany({
    orderBy: (row, { desc: d }) => [d(row.createdAt)],
  })
}

export async function addTrainingItemsFromDb(replayIds: string[]) {
  await requireAdmin()

  if (!replayIds.length) {
    throw new Error("No replay selected")
  }

  const rows = await db.query.replay.findMany({
    where: inArray(schema.replay.id, replayIds),
    columns: {
      id: true,
      title: true,
      roomId: true,
      replayData: true,
    },
    with: {
      room: {
        columns: {
          winner: true,
          player1Id: true,
          player2Id: true,
        },
      },
    },
  })

  if (!rows.length) {
    throw new Error("Replays not found")
  }

  const values = rows.map((row) => {
    const learnFromUserId =
      row.room?.winner ??
      row.replayData.player1?.id ??
      row.room?.player1Id

    if (!learnFromUserId) {
      throw new Error(`Cannot resolve learn-from user for replay ${row.title}`)
    }

    return {
      title: row.title,
      source: "database" as const,
      replayId: row.id,
      roomId: row.roomId,
      replayData: row.replayData,
      learnFromUserId,
    }
  })

  await db.insert(schema.botTrainingItem).values(values)

  return { added: values.length }
}

export async function addTrainingItemFromReplayId(params: {
  replayId: string
  learnFrom: "player1" | "player2"
  title?: string
}) {
  await requireAdmin()

  const row = await db.query.replay.findFirst({
    where: eq(schema.replay.id, params.replayId),
    columns: {
      id: true,
      title: true,
      roomId: true,
      replayData: true,
    },
  })

  if (!row?.replayData) {
    throw new Error("Replay not found")
  }

  const learnFromUserId =
    params.learnFrom === "player1"
      ? row.replayData.player1?.id
      : row.replayData.player2?.id

  if (!learnFromUserId) {
    throw new Error(`Missing ${params.learnFrom} id in replay`)
  }

  const [inserted] = await db
    .insert(schema.botTrainingItem)
    .values({
      title: params.title?.trim() || row.title,
      source: "import",
      replayId: row.id,
      roomId: row.roomId,
      replayData: row.replayData,
      learnFromUserId,
    })
    .returning({ id: schema.botTrainingItem.id })

  return { id: inserted.id }
}

/** @deprecated use client import + addTrainingItemFromReplayId */
export async function addTrainingItemFromImport(params: {
  title: string
  replayJson: string
  learnFrom: "player1" | "player2"
}) {
  await requireAdmin()

  let parsed: unknown
  try {
    parsed = JSON.parse(params.replayJson)
  } catch {
    throw new Error("Invalid JSON")
  }

  const { isReplayReference, normalizeReplayData } = await import("@bakugan-arena/game-data")

  if (isReplayReference(parsed)) {
    return addTrainingItemFromReplayId({
      replayId: parsed.id,
      learnFrom: params.learnFrom,
      title: params.title,
    })
  }

  const replayData = normalizeReplayData(parsed)

  const learnFromUserId =
    params.learnFrom === "player1"
      ? replayData.player1?.id
      : replayData.player2?.id

  if (!learnFromUserId) {
    throw new Error(`Missing ${params.learnFrom} id in replay`)
  }

  const [inserted] = await db
    .insert(schema.botTrainingItem)
    .values({
      title: params.title || `Import ${new Date().toISOString()}`,
      source: "import",
      replayId: null,
      roomId: replayData.roomId || null,
      replayData,
      learnFromUserId,
    })
    .returning({ id: schema.botTrainingItem.id })

  return { id: inserted.id }
}

export async function removeBotTrainingItems(ids: string[]) {
  await requireAdmin()
  if (!ids.length) return { removed: 0 }
  await db.delete(schema.botTrainingItem).where(inArray(schema.botTrainingItem.id, ids))
  return { removed: ids.length }
}

export async function clearBotTrainingSet() {
  await requireAdmin()
  await db.delete(schema.botTrainingItem)
  return { ok: true }
}

export async function trainBotFromTrainingSet(label?: string) {
  await requireAdmin()

  const items = await db.query.botTrainingItem.findMany()
  if (!items.length) {
    throw new Error("Training set is empty")
  }

  const active = await db.query.botScoreWeights.findFirst({
    where: eq(schema.botScoreWeights.isActive, true),
    orderBy: (row, { desc: d }) => [d(row.createdAt)],
  })

  const { trainBotScoreWeights } = await import(
    "@/src/lib/bot-training/train-bot-weights"
  )

  const { weights, metrics } = trainBotScoreWeights({
    replays: items.map((item) => ({
      replayData: item.replayData,
      learnFromUserId: item.learnFromUserId,
    })),
    baseWeights: active?.weights,
    blend: 0.45,
  })

  if (metrics.decisionsAnalyzed === 0) {
    throw new Error(
      "No player decisions extracted from the selected replays (need modern replays with snapshots)"
    )
  }

  const version = `v${Date.now()}`
  const [created] = await db
    .insert(schema.botScoreWeights)
    .values({
      version,
      label: label?.trim() || `Train ${new Date().toLocaleString()}`,
      weights,
      metrics,
      isActive: false,
    })
    .returning()

  return created
}

export async function activateBotWeightVersion(id: string) {
  await requireAdmin()

  await db.transaction(async (tx) => {
    await tx
      .update(schema.botScoreWeights)
      .set({ isActive: false })
      .where(eq(schema.botScoreWeights.isActive, true))

    await tx
      .update(schema.botScoreWeights)
      .set({ isActive: true })
      .where(eq(schema.botScoreWeights.id, id))
  })

  return { ok: true }
}

export async function activateDefaultBotWeights() {
  await requireAdmin()

  const { DEFAULT_BOT_SCORE_WEIGHTS } = await import("@bakugan-arena/drizzle-orm")

  await db.transaction(async (tx) => {
    await tx
      .update(schema.botScoreWeights)
      .set({ isActive: false })
      .where(eq(schema.botScoreWeights.isActive, true))

    await tx.insert(schema.botScoreWeights).values({
      version: `default-${Date.now()}`,
      label: "Default heuristics",
      weights: DEFAULT_BOT_SCORE_WEIGHTS,
      metrics: {
        replaysUsed: 0,
        decisionsAnalyzed: 0,
        winsUsed: 0,
        lossesUsed: 0,
        featureRates: {},
      },
      isActive: true,
    })
  })

  return { ok: true }
}

export async function updateTrainingItemLearnFrom(id: string, learnFromUserId: string) {
  await requireAdmin()
  await db
    .update(schema.botTrainingItem)
    .set({ learnFromUserId })
    .where(eq(schema.botTrainingItem.id, id))
  return { ok: true }
}
