/**
 * Runtime par room : file d’actions sérialisée + version d’état + helpers sockets.
 *
 * Problèmes adressés :
 * - Courses entre events socket concurrentes (état à moitié muté / turn-request perdu)
 * - `gameboardSocket` périmé après reconnect iframe → UI bloquée jusqu’au F5
 * - Absence d’ACK → le client ne sait pas si l’action a été acceptée
 *
 * Note UX : le client 3D continue d’attendre la fin des animations avant d’afficher
 * l’interface de tour — ce module ne change pas ce comportement.
 */
import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
    stateType,
} from "@bakugan-arena/game-data"
import type { Server, Socket } from "socket.io"
import { CheckTurnActionRequest } from "./check-turn-action-request-permissions"
import { getRoom } from "./room-registry"

type RoomQueue = {
    tail: Promise<void>
}

type RoomMeta = {
    /** Monotone version bumped on every authoritative mutation broadcast. */
    stateVersion: number
}

const queues = new Map<string, RoomQueue>()
const meta = new Map<string, RoomMeta>()

function getMeta(roomId: string): RoomMeta {
    let entry = meta.get(roomId)
    if (!entry) {
        entry = { stateVersion: 0 }
        meta.set(roomId, entry)
    }
    return entry
}

export function getRoomVersion(roomId: string): number {
    return getMeta(roomId).stateVersion
}

/** Incrémente et retourne la nouvelle version d’état. */
export function bumpRoomVersion(roomId: string): number {
    const entry = getMeta(roomId)
    entry.stateVersion += 1
    return entry.stateVersion
}

export function clearRoomRuntime(roomId: string): void {
    queues.delete(roomId)
    meta.delete(roomId)
}

/**
 * Sérialise les tâches d’une room : une mutation à la fois.
 * Les erreurs sont loggées mais n’empêchent pas la suite de la file.
 */
export function enqueueRoomTask<T>(
    roomId: string,
    task: () => T | Promise<T>,
): Promise<T> {
    const current = queues.get(roomId) ?? { tail: Promise.resolve() }

    const run = current.tail.then(task, task)

    // Empêche un rejet non géré de casser toute la chaîne suivante.
    current.tail = run.then(
        () => undefined,
        (error) => {
            console.error(`[room-queue ${roomId}]`, error)
        },
    )

    queues.set(roomId, current)
    return run
}

export type ActionResultPayload = {
    ok: boolean
    roomId: string
    event: string
    actionSeq?: number | string
    stateVersion: number
    error?: string
}

/** ACK léger vers le socket qui a initié l’action. */
export function emitActionResult(socket: Socket, payload: ActionResultPayload): void {
    socket.emit("action-result", payload)
}

/**
 * (Ré)associe les sockets Next / gameboard d’un joueur ou spectateur.
 * À appeler à chaque init / get-room-state / action reçue depuis le gameboard
 * pour éviter les emits vers un ancien `socket.id`.
 */
export function bindUserSockets(
    room: stateType,
    userId: string,
    opts: {
        gameboardSocket: string
        nextjsSocket?: string
        isSpectator?: boolean
    },
): void {
    const map = opts.isSpectator ? room.spectators : room.connectedsUsers
    const previous = map.get(userId)

    map.set(userId, {
        gameboardSocket: opts.gameboardSocket,
        nextjsSocket: opts.nextjsSocket ?? previous?.nextjsSocket ?? "",
    })
}

/**
 * Émet un event ciblé vers le gameboard d’un user.
 * Si le socket stocké est mort, tente `fallbackSocketId` (souvent `socket.id` de l’émetteur)
 * et réécrit la Map.
 */
export function emitToUserGameboard(
    io: Server,
    room: stateType,
    userId: string,
    event: string,
    payload: unknown,
    fallbackSocketId?: string,
): boolean {
    const entry = room.connectedsUsers.get(userId) ?? room.spectators.get(userId)
    let target = entry?.gameboardSocket

    if (!target && fallbackSocketId) {
        target = fallbackSocketId
        bindUserSockets(room, userId, {
            gameboardSocket: fallbackSocketId,
            nextjsSocket: entry?.nextjsSocket,
            isSpectator: room.spectators.has(userId),
        })
    }

    if (!target) {
        console.warn(
            `[emitToUserGameboard] room=${room.roomId} user=${userId} event=${event}: no gameboard socket`,
        )
        return false
    }

    io.to(target).emit(event, payload)
    return true
}

/**
 * Broadcast d’état room + bump de version.
 * Les clients peuvent ignorer `room-state-version` ; il sert au debug / futurs resync.
 */
export function emitRoomStateUpdate(
    io: Server,
    room: stateType,
    event: "update-room-state" | "turn-action" = "update-room-state",
): number {
    const stateVersion = bumpRoomVersion(room.roomId)
    io.to(room.roomId).emit(event, room)
    io.to(room.roomId).emit("room-state-version", {
        roomId: room.roomId,
        stateVersion,
    })
    return stateVersion
}

function flattenActions(
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
) {
    return [
        ...request.actions.mustDo,
        ...request.actions.mustDoOne,
        ...request.actions.optional,
    ]
}

/**
 * Renvoie les turn-action-request / additional requests pending au joueur reconnecté.
 * Remplace les early-returns silencieux qui laissaient l’UI sans actions après F5 partiel.
 */
export function emitPendingRequestsToSocket(
    io: Server,
    room: stateType,
    userId: string,
    gameboardSocketId: string,
): void {
    if (room.status.finished) return
    if (!CheckTurnActionRequest({ roomState: room, userId })) return

    const abilityRequest = room.AbilityAditionalRequest[0]
    if (abilityRequest) {
        const abilityTarget = abilityRequest.data.target
            ? abilityRequest.data.target
            : abilityRequest.userId
        if (abilityTarget === userId) {
            io.to(gameboardSocketId).emit("ability-additional-request", abilityRequest)
            return
        }
    }

    const gateRequest = room.gateCardActionRequest[0]
    if (gateRequest) {
        const gateTarget = gateRequest.data.target
            ? gateRequest.data.target
            : gateRequest.userId
        if (gateTarget === userId) {
            io.to(gameboardSocketId).emit("gate-card-additional-request", gateRequest)
            return
        }
    }

    if (room.gateCardActionRequest.length > 0 || room.AbilityAditionalRequest.length > 0) {
        return
    }

    const isActive = room.turnState.turn === userId
    const isInactive = room.turnState.previous_turn === userId

    if (isActive) {
        const request = room.ActivePlayerActionRequest
        if (flattenActions(request).length > 0) {
            io.to(gameboardSocketId).emit("turn-action-request", request)
        }
        return
    }

    if (isInactive) {
        const request = room.InactivePlayerActionRequest
        if (flattenActions(request).length > 0) {
            io.to(gameboardSocketId).emit("turn-action-request", request)
        }
    }
}

/**
 * Émet les turn-action-request active/inactive après une mutation.
 * Utilise le fallback socket pour éviter les emits fantômes.
 */
export function emitTurnActionRequests(
    io: Server,
    room: stateType,
    opts?: { fallbackSocketId?: string; onlyUserId?: string },
): void {
    if (room.status.finished) return
    if (room.gateCardActionRequest.length > 0 || room.AbilityAditionalRequest.length > 0) {
        return
    }

    const activeUserId = room.turnState.turn
    const inactiveUserId = room.turnState.previous_turn || ""

    if (!opts?.onlyUserId || opts.onlyUserId === activeUserId) {
        if (CheckTurnActionRequest({ roomState: room, userId: activeUserId })) {
            const request = room.ActivePlayerActionRequest
            if (flattenActions(request).length > 0) {
                emitToUserGameboard(
                    io,
                    room,
                    activeUserId,
                    "turn-action-request",
                    request,
                    opts?.fallbackSocketId,
                )
            }
        }
    }

    if (inactiveUserId && (!opts?.onlyUserId || opts.onlyUserId === inactiveUserId)) {
        if (CheckTurnActionRequest({ roomState: room, userId: inactiveUserId })) {
            const request = room.InactivePlayerActionRequest
            if (flattenActions(request).length > 0) {
                emitToUserGameboard(
                    io,
                    room,
                    inactiveUserId,
                    "turn-action-request",
                    request,
                    opts?.fallbackSocketId,
                )
            }
        }
    }
}

/**
 * Enveloppe un handler socket mutateur : queue room + ACK action-result.
 */
export function runRoomSocketAction(opts: {
    socket: Socket
    roomId: string
    event: string
    actionSeq?: number | string
    userId?: string
    isSpectator?: boolean
    nextjsSocket?: string
    handler: (room: stateType) => void | Promise<void>
}): void {
    const {
        socket,
        roomId,
        event,
        actionSeq,
        userId,
        isSpectator,
        nextjsSocket,
        handler,
    } = opts

    void enqueueRoomTask(roomId, async () => {
        const room = getRoom(roomId)
        if (!room) {
            emitActionResult(socket, {
                ok: false,
                roomId,
                event,
                actionSeq,
                stateVersion: getRoomVersion(roomId),
                error: "room_not_found",
            })
            return
        }

        if (userId) {
            bindUserSockets(room, userId, {
                gameboardSocket: socket.id,
                nextjsSocket,
                isSpectator,
            })
        }

        try {
            await handler(room)
            emitActionResult(socket, {
                ok: true,
                roomId,
                event,
                actionSeq,
                stateVersion: getRoomVersion(roomId),
            })
        } catch (error) {
            console.error(`[room-action ${roomId}/${event}]`, error)
            emitActionResult(socket, {
                ok: false,
                roomId,
                event,
                actionSeq,
                stateVersion: getRoomVersion(roomId),
                error: error instanceof Error ? error.message : String(error),
            })
        }
    })
}
