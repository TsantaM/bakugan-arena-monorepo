import { Message, replayEntryType, replaySnapshotType, stateType, logDiagnostic, buildActionRequestsSummary } from "@bakugan-arena/game-data";
import { Server } from "socket.io";
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { intervalIds } from "../game-state/battle-brawlers-game-state";
import { CalculateAndUpdateElo } from "./ladder-functions/calculate-elo";
import { SendUserRooms } from "./send-user-rooms";

const rooms = schema.rooms

export const TIMER_INITIAL_SECONDS = 5 * 60
export const TIMER_ACTION_INCREMENT_SECONDS = 5
export const TIMER_MAX_SECONDS = 5 * 60

export type PlayerTimerPayload = {
    userId: string
    remaining: number
    deadlineAt: number | null
    serverNow: number
    running: boolean
}

export type PlayerTimerSnapshot = {
    userId: string
    timer: number
    deadlineAt: number | null
    running: boolean
    serverNow: number
}

type RoomTimerEntry = (typeof intervalIds)[number]
type PlayerTimerEntry = RoomTimerEntry["players"][number]

export function ensureRoomTimerRegistry(roomState: stateType) {
    if (intervalIds.some((entry) => entry.roomId === roomState.roomId)) return

    intervalIds.push({
        roomId: roomState.roomId,
        finishing: false,
        players: roomState.players.map((player) => ({
            userId: player.userId,
            timeoutId: null,
            deadlineAt: null,
        })),
    })

    logDiagnostic(roomState, {
        handler: "syncClocks",
        level: "warn",
        message: "Entrée timer recréée à la volée",
        output: { roomId: roomState.roomId },
    })
}

function getRoomTimers(roomId: string): RoomTimerEntry | undefined {
    return intervalIds.find((i) => i.roomId === roomId)
}

function getPlayerTimerEntry(roomId: string, userId: string): PlayerTimerEntry | undefined {
    return getRoomTimers(roomId)?.players.find((p) => p.userId === userId)
}

function countActions(actions: {
    mustDo: unknown[]
    mustDoOne: unknown[]
    optional: unknown[]
}) {
    return actions.mustDo.length + actions.mustDoOne.length + actions.optional.length
}

function freezePlayerClock(player: { timer: number }, entry: PlayerTimerEntry, now = Date.now()) {
    if (entry.timeoutId !== null) {
        clearTimeout(entry.timeoutId)
        entry.timeoutId = null
    }
    if (entry.deadlineAt !== null) {
        player.timer = Math.max(0, Math.ceil((entry.deadlineAt - now) / 1000))
        entry.deadlineAt = null
    }
}

function buildPayload(
    userId: string,
    remaining: number,
    deadlineAt: number | null,
    running: boolean,
    serverNow = Date.now(),
): PlayerTimerPayload {
    return { userId, remaining, deadlineAt, serverNow, running }
}

function emitTimer(io: Server | undefined, roomId: string, payload: PlayerTimerPayload) {
    if (!io) return
    io.to(roomId).emit("player-timer", payload)
}

export function getPlayerTimerSnapshots(roomState: stateType, now = Date.now()): PlayerTimerSnapshot[] {
    const entry = getRoomTimers(roomState.roomId)
    return roomState.players.map((player) => {
        const playerEntry = entry?.players.find((p) => p.userId === player.userId)
        const running = playerEntry?.deadlineAt != null
        const remaining = running && playerEntry?.deadlineAt != null
            ? Math.max(0, Math.ceil((playerEntry.deadlineAt - now) / 1000))
            : player.timer
        return {
            userId: player.userId,
            timer: remaining,
            deadlineAt: playerEntry?.deadlineAt ?? null,
            running,
            serverNow: now,
        }
    })
}

function getRunningUserIds(roomState: stateType): Set<string> {
    if (roomState.status.finished) return new Set()

    const abilityReq = roomState.AbilityAditionalRequest[0]
    if (abilityReq) {
        const targetId = abilityReq.data.target ?? abilityReq.userId
        return new Set([targetId])
    }

    const gateReq = roomState.gateCardActionRequest[0]
    if (gateReq) {
        const targetId = gateReq.data.target ?? gateReq.userId
        return new Set([targetId])
    }

    const running = new Set<string>()
    if (countActions(roomState.ActivePlayerActionRequest.actions) > 0) {
        running.add(roomState.turnState.turn)
    }
    if (
        roomState.turnState.previous_turn &&
        countActions(roomState.InactivePlayerActionRequest.actions) > 0
    ) {
        running.add(roomState.turnState.previous_turn)
    }
    return running
}

async function finishByTimeout({
    roomState,
    io,
    timedOutUserId,
}: {
    roomState: stateType
    io?: Server
    timedOutUserId: string
}) {
    const roomTimers = getRoomTimers(roomState.roomId)
    if (!roomTimers || roomTimers.finishing || roomState.status.finished) return

    roomTimers.finishing = true

    const now = Date.now()
    for (const player of roomState.players) {
        const entry = getPlayerTimerEntry(roomState.roomId, player.userId)
        if (entry) freezePlayerClock(player, entry, now)
    }

    const turnCount = roomState.turnState.turnCount

    // Tour 0 : égalité
    if (turnCount === 0) {
        roomState.status.finished = true
        roomState.status.finisheAt = now
        roomState.status.winner = null

        await db
            .update(rooms)
            .set({ finished: true })
            .where(eq(rooms.id, roomState.roomId))

        if (io) {
            const message: Message = {
                key: "game_over_draw",
                turn: turnCount,
            }
            io.to(roomState.roomId).emit("game-finished", message)

            const roomData: {
                p1: string
                p2: string
                roomId: string
                finished: boolean
                replay: replayEntryType[]
                initialSnapshot: replaySnapshotType
            } = {
                roomId: roomState.roomId,
                p1: roomState.players[0].userId,
                p2: roomState.players[1].userId,
                replay: roomState.animationsForReplay,
                initialSnapshot: roomState.initialReplaySnapshot,
                finished: roomState.status.finished,
            }
            roomState.connectedsUsers.forEach((player) => {
                io.to(player.nextjsSocket).emit("final-room-state", roomData)
            })
            roomState.players.forEach((user) => {
                SendUserRooms({ userId: user.userId, io })
            })
        }
        return
    }

    const looser = timedOutUserId
    const winner = roomState.players.find((p) => p.userId !== looser)?.userId
    if (!winner) return

    await db
        .update(rooms)
        .set({
            winner,
            looser,
            finished: true,
        })
        .where(eq(rooms.id, roomState.roomId))

    roomState.status.finished = true
    roomState.status.finisheAt = now
    roomState.status.winner = winner

    if (io) {
        await CalculateAndUpdateElo({
            loser: looser,
            winner,
            roomData: roomState,
            io,
            roomId: roomState.roomId,
        })
        roomState.players.forEach((user) => {
            SendUserRooms({ userId: user.userId, io })
        })
    }
}

function startPlayerClock({
    roomState,
    userId,
    io,
    now = Date.now(),
}: {
    roomState: stateType
    userId: string
    io?: Server
    now?: number
}) {
    const player = roomState.players.find((p) => p.userId === userId)
    const entry = getPlayerTimerEntry(roomState.roomId, userId)
    if (!player || !entry) return
    if (roomState.status.finished) return
    if (player.timer <= 0) {
        void finishByTimeout({ roomState, io, timedOutUserId: userId })
        return
    }

    // Déjà en cours avec la même bank → ne pas reset
    if (entry.deadlineAt !== null && entry.timeoutId !== null) {
        emitTimer(
            io,
            roomState.roomId,
            buildPayload(userId, Math.max(0, Math.ceil((entry.deadlineAt - now) / 1000)), entry.deadlineAt, true, now),
        )
        return
    }

    freezePlayerClock(player, entry, now)

    const deadlineAt = now + player.timer * 1000
    entry.deadlineAt = deadlineAt
    entry.timeoutId = setTimeout(() => {
        entry.timeoutId = null
        entry.deadlineAt = null
        player.timer = 0
        void finishByTimeout({ roomState, io, timedOutUserId: userId })
    }, Math.max(0, deadlineAt - Date.now()))

    emitTimer(io, roomState.roomId, buildPayload(userId, player.timer, deadlineAt, true, now))
}

function stopPlayerClock({
    roomState,
    userId,
    io,
    now = Date.now(),
    emit = true,
}: {
    roomState: stateType
    userId: string
    io?: Server
    now?: number
    emit?: boolean
}) {
    const player = roomState.players.find((p) => p.userId === userId)
    const entry = getPlayerTimerEntry(roomState.roomId, userId)
    if (!player || !entry) return

    const wasRunning = entry.deadlineAt !== null
    freezePlayerClock(player, entry, now)
    if (emit && (wasRunning || io)) {
        emitTimer(io, roomState.roomId, buildPayload(userId, player.timer, null, false, now))
    }
}

/** Stoppe le chronomètre d'un joueur (freeze remaining). */
export function StopPlayerTimer({
    roomState,
    userId,
    io,
}: {
    roomState: stateType
    userId: string
    io?: Server
}) {
    stopPlayerClock({ roomState, userId, io, emit: true })
}

/** Démarre le chronomètre d'un joueur. Préférer syncClocks. */
export function StartPlayerTime({
    roomState,
    userId,
    io,
}: {
    roomState: stateType
    userId: string
    io?: Server
}) {
    startPlayerClock({ roomState, userId, io })
}

/**
 * Source de vérité : démarre/arrête les clocks selon les action / additional requests.
 */
export function syncClocks({ roomState, io }: { roomState: stateType; io: Server }) {
    if (!roomState) return
    ensureRoomTimerRegistry(roomState)
    const roomTimers = getRoomTimers(roomState.roomId)
    if (!roomTimers) return

    const now = Date.now()

    if (roomState.status.finished) {
        for (const player of roomState.players) {
            stopPlayerClock({ roomState, userId: player.userId, io, now, emit: true })
        }
        logDiagnostic(roomState, {
            handler: "syncClocks",
            message: "Chronomètres arrêtés — partie terminée",
            output: { finished: true },
        })
        return
    }

    const shouldRun = getRunningUserIds(roomState)
    const timerTransitions: {
        userId: string
        before: boolean
        after: boolean
        remaining: number
        deadlineAt: number | null
        transition: string
    }[] = []

    for (const player of roomState.players) {
        const wasRunning = getPlayerTimerEntry(roomState.roomId, player.userId)?.deadlineAt != null
        if (shouldRun.has(player.userId)) {
            startPlayerClock({ roomState, userId: player.userId, io, now })
        } else {
            stopPlayerClock({ roomState, userId: player.userId, io, now, emit: true })
        }
        const entry = getPlayerTimerEntry(roomState.roomId, player.userId)
        const isRunning = entry?.deadlineAt != null
        timerTransitions.push({
            userId: player.userId,
            before: wasRunning,
            after: isRunning,
            remaining: player.timer,
            deadlineAt: entry?.deadlineAt ?? null,
            transition: wasRunning === isRunning
                ? (isRunning ? "unchanged_running" : "unchanged_stopped")
                : (isRunning ? "started" : "stopped"),
        })
    }

    logDiagnostic(roomState, {
        handler: "syncClocks",
        message: "Synchronisation des chronomètres",
        level: shouldRun.size === 0 ? "warn" : "info",
        output: {
            shouldRun: [...shouldRun],
            timerRegistryPresent: true,
            actionRequests: buildActionRequestsSummary(roomState),
            transitions: timerTransitions,
        },
    })
}

/** Alias historique — redirige vers syncClocks. */
export function UpdatePlayerTimer({ roomState, io }: { roomState: stateType; io: Server }) {
    syncClocks({ roomState, io })
}

/** Alias historique (tour 0) — redirige vers syncClocks. */
export function StartTwoTimers({
    roomState,
    io,
}: {
    roomState: stateType
    io: Server
    roomId?: string
}) {
    syncClocks({ roomState, io })
}

/**
 * Fischer : +TIMER_ACTION_INCREMENT_SECONDS après une action valide, plafonné à TIMER_MAX_SECONDS.
 */
export function grantActionIncrement({
    roomState,
    userId,
    io,
    seconds = TIMER_ACTION_INCREMENT_SECONDS,
}: {
    roomState: stateType
    userId: string
    io?: Server
    seconds?: number
}) {
    if (!roomState || roomState.status.finished) return
    const player = roomState.players.find((p) => p.userId === userId)
    const entry = getPlayerTimerEntry(roomState.roomId, userId)
    if (!player || !entry) return

    const now = Date.now()
    const wasRunning = entry.deadlineAt !== null

    if (wasRunning) {
        freezePlayerClock(player, entry, now)
    }

    player.timer = Math.min(TIMER_MAX_SECONDS, player.timer + seconds)

    if (wasRunning) {
        startPlayerClock({ roomState, userId, io, now })
    } else {
        emitTimer(io, roomState.roomId, buildPayload(userId, player.timer, null, false, now))
    }
}

/** Nettoie timeouts + entrée intervalIds pour une room (cleanup / fin). */
export function clearRoomTimers(roomId: string) {
    const index = intervalIds.findIndex((i) => i.roomId === roomId)
    if (index === -1) return
    const entry = intervalIds[index]
    for (const player of entry.players) {
        if (player.timeoutId !== null) {
            clearTimeout(player.timeoutId)
            player.timeoutId = null
        }
        player.deadlineAt = null
    }
    intervalIds.splice(index, 1)
}

export function stopAllRoomClocks({
    roomState,
    io,
}: {
    roomState: stateType
    io?: Server
}) {
    const now = Date.now()
    for (const player of roomState.players) {
        stopPlayerClock({ roomState, userId: player.userId, io, now, emit: Boolean(io) })
    }
}
