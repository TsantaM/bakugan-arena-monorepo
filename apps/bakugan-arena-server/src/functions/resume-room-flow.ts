import {
    countActionRequestActions,
    logDiagnostic,
    stateType,
} from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { emitTurnActionRequestsWithDiagnostics } from "./log-turn-action-requests"
import { ensureRoomTimerRegistry, syncClocks } from "./start-player-timer"
import { clearAnimationsInRoom } from "../sockets/clear-animations-socket"

export const ADDITIONAL_REQUEST_TIMEOUT_MS = 60_000

const additionalPendingSince = new Map<string, number>()

export function markAdditionalPending(roomId: string) {
    if (!additionalPendingSince.has(roomId)) {
        additionalPendingSince.set(roomId, Date.now())
    }
}

export function clearAdditionalPending(roomId: string) {
    const room = Battle_Brawlers_Game_State.find((entry) => entry?.roomId === roomId)
    if (!room) {
        additionalPendingSince.delete(roomId)
        return
    }
    if (
        room.gateCardActionRequest.length === 0 &&
        room.AbilityAditionalRequest.length === 0
    ) {
        additionalPendingSince.delete(roomId)
    }
}

function isAdditionalTimedOut(roomId: string): boolean {
    const since = additionalPendingSince.get(roomId)
    if (since === undefined) return false
    return Date.now() - since >= ADDITIONAL_REQUEST_TIMEOUT_MS
}

export type PendingEmitResult =
    | { status: "none" }
    | { status: "emitted"; kind: "gate" | "ability" }
    | { status: "blocked"; kind: "gate" | "ability"; targetUserId: string; timedOut: boolean }

export function tryEmitPendingAdditionalRequest(
    roomState: stateType,
    io: Server,
): PendingEmitResult {
    const gate = roomState.gateCardActionRequest[0]
    if (gate) {
        markAdditionalPending(roomState.roomId)
        const targetUserId = gate.data.target ?? gate.userId
        const targetSocket = roomState.connectedsUsers.get(targetUserId)
        if (targetSocket) {
            io.to(targetSocket.gameboardSocket).emit(
                "gate-card-additional-request",
                gate,
            )
            return { status: "emitted", kind: "gate" }
        }
        return {
            status: "blocked",
            kind: "gate",
            targetUserId,
            timedOut: isAdditionalTimedOut(roomState.roomId),
        }
    }

    const ability = roomState.AbilityAditionalRequest[0]
    if (ability) {
        markAdditionalPending(roomState.roomId)
        const targetUserId = ability.data.target ?? ability.userId
        const targetSocket = roomState.connectedsUsers.get(targetUserId)
        if (targetSocket) {
            io.to(targetSocket.gameboardSocket).emit(
                "ability-additional-request",
                ability,
            )
            return { status: "emitted", kind: "ability" }
        }
        return {
            status: "blocked",
            kind: "ability",
            targetUserId,
            timedOut: isAdditionalTimedOut(roomState.roomId),
        }
    }

    clearAdditionalPending(roomState.roomId)
    return { status: "none" }
}

export function continueRoomFlowAfterAdditional({
    roomState,
    io,
    userId,
    source,
    forceTurnActionUpdater = false,
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
    forceTurnActionUpdater?: boolean
}) {
    if (roomState.status.finished) return

    const activeCounts = countActionRequestActions(
        roomState.ActivePlayerActionRequest.actions,
    )
    const inactiveCounts = countActionRequestActions(
        roomState.InactivePlayerActionRequest.actions,
    )

    if (
        forceTurnActionUpdater ||
        (activeCounts.total === 0 &&
            inactiveCounts.total === 0 &&
            roomState.turnState.turnCount > 0)
    ) {
        clearAnimationsInRoom(roomState.roomId)
        invokeTurnActionUpdater({ roomId: roomState.roomId, userId, io })
        return
    }

    emitTurnActionRequestsWithDiagnostics({
        roomState,
        io,
        userId,
        source,
    })
}

function invokeTurnActionUpdater({
    roomId,
    userId,
    io,
}: {
    roomId: string
    userId: string
    io: Server
}) {
    const { turnActionUpdater } = require("../sockets/turn-action") as typeof import("../sockets/turn-action")
    turnActionUpdater({ roomId, userId, io })
}

export function resumeRoomFlow({
    roomState,
    io,
    userId,
    source,
    autoSkipAdditional = true,
    autoSkipGateAdditional,
    autoSkipAbilityAdditional,
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
    autoSkipAdditional?: boolean
    autoSkipGateAdditional?: (args: { roomState: stateType; io: Server }) => boolean
    autoSkipAbilityAdditional?: (args: { roomState: stateType; io: Server }) => boolean
}) {
    if (roomState.status.finished) return

    ensureRoomTimerRegistry(roomState)

    let pending = tryEmitPendingAdditionalRequest(roomState, io)

    while (
        autoSkipAdditional &&
        pending.status === "blocked" &&
        pending.timedOut
    ) {
        logDiagnostic(roomState, {
            handler: "additional.auto-skip",
            level: "warn",
            message: "Additional request expirée — SKIP_ACTION automatique",
            output: {
                kind: pending.kind,
                targetUserId: pending.targetUserId,
                timeoutMs: ADDITIONAL_REQUEST_TIMEOUT_MS,
                source,
            },
        })

        const skipped =
            pending.kind === "gate"
                ? autoSkipGateAdditional?.({ roomState, io }) ?? false
                : autoSkipAbilityAdditional?.({ roomState, io }) ?? false

        if (!skipped) break

        pending = tryEmitPendingAdditionalRequest(roomState, io)
    }

    if (pending.status === "emitted" || pending.status === "blocked") {
        if (pending.status === "blocked") {
            logDiagnostic(roomState, {
                handler: "additional.blocked",
                level: "warn",
                message: "Additional request en attente — socket cible absente",
                output: {
                    kind: pending.kind,
                    targetUserId: pending.targetUserId,
                    source,
                },
            })
        }
        syncClocks({ roomState, io })
        return
    }

    continueRoomFlowAfterAdditional({
        roomState,
        io,
        userId,
        source,
    })
    syncClocks({ roomState, io })
}
