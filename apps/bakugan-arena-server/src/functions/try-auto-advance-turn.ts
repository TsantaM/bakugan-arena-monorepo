import {
    countActionRequestActions,
    logDiagnostic,
    type stateType,
} from "@bakugan-arena/game-data"
import type { Server } from "socket.io"
import { clearAnimationsInRoom } from "../sockets/clear-animations-socket"
import { emitTurnActionRequestsWithDiagnostics } from "./log-turn-action-requests"
import { turnActionUpdater } from "../sockets/turn-action"

/**
 * Avance le tour seulement si le joueur actif n'a plus d'actions.
 * Le joueur inactif ne déclenche jamais seul un passage de tour.
 */
export function tryAutoAdvanceTurn({
    roomState,
    io,
    userId,
    source,
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
}): boolean {
    if (roomState.status.finished) return false

    const activeCounts = countActionRequestActions(
        roomState.ActivePlayerActionRequest.actions,
    )
    const inactiveCounts = countActionRequestActions(
        roomState.InactivePlayerActionRequest.actions,
    )

    const isActivePlayer = roomState.turnState.turn === userId

    if (isActivePlayer) {
        if (activeCounts.total > 0) return false
        clearAnimationsInRoom(roomState.roomId)
        turnActionUpdater({ roomId: roomState.roomId, userId, io })
        return true
    }

    if (inactiveCounts.total > 0) return false

    logDiagnostic(roomState, {
        handler: "tryAutoAdvanceTurn.inactive-done",
        level: "info",
        message: "Joueur inactif sans actions — attente du joueur actif",
        output: {
            source,
            activePlayerId: roomState.turnState.turn,
            inactivePlayerId: userId,
            activeActionsRemaining: activeCounts.total,
        },
    })

    emitTurnActionRequestsWithDiagnostics({
        roomState,
        io,
        userId: roomState.turnState.turn,
        source: `${source}.inactive-done`,
    })
    return false
}
