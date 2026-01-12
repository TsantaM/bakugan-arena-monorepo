import { Server, Socket } from "socket.io/dist";
import { ActiveGateCard } from "../functions/active-gate-card";
import { activeGateCardProps } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { removeActionByType } from "@bakugan-arena/game-data/src/function/create-animation-directives/remove-action-by-type";
import { ActivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";

export const socketActiveGateCard = (io: Server, socket: Socket) => {
    socket.on('active-gate-card', ({ roomId, gateId, slot, userId }: activeGateCardProps) => {
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        clearAnimationsInRoom(roomId)

        ActiveGateCard({ roomId, gateId, slot, userId, io })


        io.to(roomId).emit('animations', state.animations)


        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
        if (roomIndex === -1) return
        if (!Battle_Brawlers_Game_State[roomIndex]) return


        if (state.turnState.turn === userId) {

            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "OPEN_GATE_CARD")


            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            if (activeSocket) {
                if (merged.length > 0) {
                    io.to(activeSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                } else {
                    clearAnimationsInRoom(roomId)
                    turnActionUpdater({ roomId, userId, io })
                }
            }



        }

        if (state.turnState.turn !== userId) {
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "OPEN_GATE_CARD")


            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            if (inactiveSocket) {
                if (merged.length > 0) {
                    io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
                } else {
                    clearAnimationsInRoom(roomId)
                    turnActionUpdater({ roomId, userId, io })
                }
            }

        }



    })
}