import { Server, Socket } from "socket.io";
import { ActiveGateCard } from "../functions/active-gate-card";
import { activeGateCardProps, ActivePlayerActionRequestType, InactivePlayerActionRequestType, removeActionByType } from "@bakugan-arena/game-data";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { grantActionIncrement, syncClocks } from "../functions/start-player-timer";

export const socketActiveGateCard = (io: Server, socket: Socket) => {
    socket.on('active-gate-card', ({ roomId, gateId, slot, userId }: activeGateCardProps) => {
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        if (state.status.finished === true) return

        clearAnimationsInRoom(roomId)

        const result = ActiveGateCard({ roomId, gateId, slot, userId, io })

        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
        if (roomIndex === -1) return
        if (!Battle_Brawlers_Game_State[roomIndex]) return

        if (result !== false) {
            grantActionIncrement({ roomState: state, userId, io })
        }

        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        // Retirer OPEN_GATE_CARD de la request du joueur
        if (state.turnState.turn === userId) {
            const newState = removeActionByType(
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest,
                "OPEN_GATE_CARD"
            )
            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest =
                newState as ActivePlayerActionRequestType
        } else {
            const newState = removeActionByType(
                Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest,
                "OPEN_GATE_CARD"
            )
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest =
                newState as InactivePlayerActionRequestType
        }

        // Déjà géré entièrement (additional ou turn advance) — pas de 2ᵉ emit / advance
        if (result === "additional" || result === "turn_advanced") {
            syncClocks({ roomState: state, io })
            return
        }

        // Gate ouverte sans emit interne, ou noop : émettre les anims restantes une seule fois
        if (result === "opened" || state.animations.length > 0) {
            const batch = [...state.animations]
            io.to(roomId).emit('animations', batch)
            batch.forEach((animation) => EmitMessage({ roomState: state, animation, io }))
            state.animations = []
        }

        if (result === false) return

        const checker = CheckTurnActionRequest({ roomState: state, userId: userId })
        if (!checker) {
            syncClocks({ roomState: state, io })
            return
        }

        if (state.turnState.turn === userId) {
            const merged = [
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo,
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne,
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional,
            ].flat()

            if (!activeSocket) {
                syncClocks({ roomState: state, io })
                return
            }
            if (merged.length > 0) {
                io.to(activeSocket.gameboardSocket).emit(
                    'turn-action-request',
                    Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest
                )
                syncClocks({ roomState: state, io })
            } else {
                clearAnimationsInRoom(roomId)
                turnActionUpdater({ roomId, userId, io })
            }
            return
        }

        const merged = [
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo,
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne,
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional,
        ].flat()

        if (!inactiveSocket) {
            syncClocks({ roomState: state, io })
            return
        }
        if (merged.length > 0) {
            io.to(inactiveSocket.gameboardSocket).emit(
                'turn-action-request',
                Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest
            )
            syncClocks({ roomState: state, io })
        } else {
            clearAnimationsInRoom(roomId)
            turnActionUpdater({ roomId, userId, io })
        }
    })
}
