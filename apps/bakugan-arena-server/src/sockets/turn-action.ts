import { Server, Socket } from "socket.io";
import { CheckBattleStillInProcess, CreateActionRequestFunction, handleBattle, handleGateCards, turnCountSocketProps, updateTurnState } from "@bakugan-arena/game-data";
import { CheckGameFinished } from "../functions/CheckGameFinished";
import { onBattleEnd } from "../functions/on-battle-end";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { ClearDomain } from "../functions/clear-domain";
import { UpdatePlayerTimer } from "../functions/start-player-timer";
import { EmitMessage } from "../functions/emit-messages";
import { ActiveGateCard } from "../functions/active-gate-card";
import { getRoom } from "../functions/room-registry";
import {
    emitRoomStateUpdate,
    emitTurnActionRequests,
    runRoomSocketAction,
} from "../functions/room-runtime";

/**
 * Avance le tour / résout gates auto / broadcast état + turn-action-request.
 * Les turn-request sont émis via `emitTurnActionRequests` (rebind + fallback socket).
 */
export function turnActionUpdater({
    roomId,
    userId,
    io,
    updateBattleState = true,
    fallbackSocketId,
}: {
    roomId: string
    userId: string
    io: Server
    updateBattleState?: boolean
    fallbackSocketId?: string
}) {
    const roomData = getRoom(roomId)
    if (!roomData) return
    if (roomData.status.finished === true) return

    handleBattle(roomData, updateBattleState)

    const opennable = handleGateCards(roomData)

    if (opennable.length > 0) {
        for (const card of opennable) {
            const result = ActiveGateCard({
                gateId: card.gateId,
                roomId: roomId,
                slot: card.slot,
                userId: card.userId,
                io: io
            })
            // Additional en cours OU tour déjà avancé en interne → ne pas continuer
            if (result === 'additional' || result === 'turn_advanced') return
        }
    }

    if (roomData && roomData.battleState.turns === 0 && roomData.battleState.battleInProcess && !roomData.battleState.paused) {
        onBattleEnd({ roomId })
        CheckGameFinished({ roomId, roomState: roomData, io })
    }

    CheckGameFinished({ roomId, roomState: roomData, io })

    CheckBattleStillInProcess(roomData)

    ClearDomain(roomData, userId)

    updateTurnState(roomData)

    CreateActionRequestFunction({ roomState: roomData })

    const animations = roomData.animations
    emitRoomStateUpdate(io, roomData, "turn-action")
    io.to(roomId).emit('animations', animations)
    roomData.animations.forEach((animation) => EmitMessage({ roomState: roomData, animation, io }))

    const turnState: turnCountSocketProps = {
        turnCount: roomData.turnState.turnCount,
        battleTurn: roomData.battleState.battleInProcess ? roomData.battleState.turns : undefined
    }

    io.to(roomId).emit('turn-count-updater', turnState)

    clearAnimationsInRoom(roomId)

    emitTurnActionRequests(io, roomData, { fallbackSocketId })

    UpdatePlayerTimer({
        io: io,
        roomState: roomData
    })
}

export const socketTurn = (io: Server, socket: Socket) => {
    socket.on('turn-action', (payload: {
        roomId: string
        userId: string
        actionSeq?: number | string
    }) => {
        const { roomId, userId, actionSeq } = payload
        runRoomSocketAction({
            socket,
            roomId,
            event: 'turn-action',
            actionSeq,
            userId,
            handler: () => {
                turnActionUpdater({
                    roomId,
                    userId,
                    io,
                    fallbackSocketId: socket.id,
                })
            },
        })
    })
}
