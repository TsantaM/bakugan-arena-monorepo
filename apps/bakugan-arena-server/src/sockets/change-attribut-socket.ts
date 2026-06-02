import { ActivePlayerActionRequestType, attribut, bakuganOnSlot, Bakugans, ChangeAttributAnimationDirective, GateCards, InactivePlayerActionRequestType, Message, removeActionByType, Slots } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";
import { EmitMessage } from "../functions/emit-messages";

export function ChangeAttributSocket(io: Server, socket: Socket) {
    socket.on('change-attribut', ({ roomId, attribut, bakugan, userId }: { roomId: string, bakugan: bakuganOnSlot, attribut: attribut, userId: string }) => {

        const roomState = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!roomState) return
        if (roomState.status.finished === true) return
        const activeSocket = roomState.connectedsUsers.get(roomState.turnState.turn)
        const inactiveSocket = roomState.connectedsUsers.get(roomState.turnState.previous_turn || '')
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
        if (roomIndex === -1) return
        if (!Battle_Brawlers_Game_State[roomIndex]) return

        const slot = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const target = slot.bakugans.find((b) => b.userId === bakugan.userId && b.key === bakugan.key)
        if (!target) return
        if (target.alreadyChangeAttribut === true) return

        const message: Message = {
            text: `${Bakugans[bakugan.key].name} change his attribut to ${attribut}.`,
            turn: roomState.turnState.turnCount
        }

        ChangeAttributAnimationDirective({
            attribut: attribut,
            bakugan: structuredClone(target),
            message: [message],
            roomState: Battle_Brawlers_Game_State[roomIndex]
        })

        target.attribut = attribut
        target.alreadyChangeAttribut = true

        if(slot.portalCard !== null && slot.state.open && !slot.state.canceled) {
            const card = GateCards[slot.portalCard.key]
            if(card.onAttributChange) card.onAttributChange({
                attribut,
                bakugan: target,
                roomState,
                slot
            })
        }

        io.to(roomId).emit('animations', roomState.animations)
        roomState.animations.forEach((animation) => EmitMessage({ roomState: roomState, animation, io }))

        if (roomState.turnState.turn === userId) {

            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "CHANGE_ATTRIBUTE")

            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: roomState, userId: userId })
            if (!checker) return

            if (activeSocket) {
                if (merged.length > 0) {
                    io.to(activeSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                } else {
                    clearAnimationsInRoom(roomId)
                    turnActionUpdater({ roomId, userId, io })
                }
            }



        }

        if (roomState.turnState.turn !== userId) {
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "OPEN_GATE_CARD")


            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: roomState, userId: userId })
            if (!checker) return

            if (inactiveSocket) {
                if (merged.length > 0) {
                    io.to(inactiveSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
                } else {
                    clearAnimationsInRoom(roomId)
                    turnActionUpdater({ roomId, userId, io })
                }
            }

        }
    })
}