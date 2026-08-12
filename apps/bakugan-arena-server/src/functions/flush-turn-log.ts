import type { stateType, TurnLogBundle } from "@bakugan-arena/game-data"
import { GAME_LOGS_ENABLED, attachActionRequestsToLastTurn, finalizeTurnLog } from "@bakugan-arena/game-data"
import { schema } from "@bakugan-arena/drizzle-orm"
import { db } from "../lib/db"

const { gameTurnLog } = schema

async function upsertTurnLogBundle(roomId: string, bundle: TurnLogBundle): Promise<void> {
    await db
        .insert(gameTurnLog)
        .values({
            roomId,
            turnNumber: bundle.turnNumber,
            turnCount: bundle.turnCount,
            logData: bundle,
        })
        .onConflictDoUpdate({
            target: [gameTurnLog.roomId, gameTurnLog.turnNumber],
            set: {
                turnCount: bundle.turnCount,
                logData: bundle,
            },
        })
}

function prepareGameLogsForPersistence(roomState: stateType): TurnLogBundle[] {
    if (!roomState.gameLog) return []

    attachActionRequestsToLastTurn(roomState)

    if (roomState.gameLog.currentTurnEvents.length > 0) {
        finalizeTurnLog(roomState)
        attachActionRequestsToLastTurn(roomState)
    }

    return roomState.gameLog.turnLogs
}

/**
 * Écrit tous les logs accumulés en mémoire en BDD.
 * Appelé à la fin de partie ou lors du cleanup de la room.
 */
export async function persistAllGameLogs(roomState: stateType): Promise<void> {
    if (!GAME_LOGS_ENABLED) return
    if (!roomState.gameLog || roomState.gameLog.persisted) return

    const bundles = prepareGameLogsForPersistence(roomState)
    if (bundles.length === 0) return

    try {
        for (const bundle of bundles) {
            await upsertTurnLogBundle(roomState.roomId, bundle)
        }
        roomState.gameLog.persisted = true
    } catch (error) {
        console.error("[game-log] persist failed", {
            roomId: roomState.roomId,
            turnCount: bundles.length,
            error,
        })
    }
}
