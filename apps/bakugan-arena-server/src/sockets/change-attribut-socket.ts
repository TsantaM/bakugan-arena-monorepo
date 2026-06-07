import { ActivePlayerActionRequestType, attribut, bakuganOnSlot, Bakugans, ChangeAttributAnimationDirective, GateCards, InactivePlayerActionRequestType, Message, removeActionByType, Slots } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";
import { EmitMessage } from "../functions/emit-messages";
import { AddAbilities } from "./update-bakugans-state";

export function ChangeAttributSocket(io: Server, socket: Socket) {
    socket.on('change-attribut', ({ roomId, attribut, bakugan, userId }: { roomId: string, bakugan: bakuganOnSlot, attribut: attribut, userId: string }) => {

        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
        if (roomIndex === -1) return
        if (!Battle_Brawlers_Game_State[roomIndex]) return

        const roomState = Battle_Brawlers_Game_State[roomIndex]
        if (roomState.status.finished === true) return
        const activeSocket = roomState.connectedsUsers.get(roomState.turnState.turn)
        const inactiveSocket = roomState.connectedsUsers.get(roomState.turnState.previous_turn || '')

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
            roomState: roomState
        })

        target.attribut = attribut
        target.alreadyChangeAttribut = true

        if (slot.portalCard !== null && slot.state.open && !slot.state.canceled) {
            const card = GateCards[slot.portalCard.key]
            if (card.onAttributChange) card.onAttributChange({
                attribut,
                bakugan: target,
                roomState: Battle_Brawlers_Game_State[roomIndex],
                slot
            })
        }

        io.to(roomId).emit('animations', Battle_Brawlers_Game_State[roomIndex].animations)
        Battle_Brawlers_Game_State[roomIndex].animations.forEach((animation) => EmitMessage({ roomState: Battle_Brawlers_Game_State[roomIndex], animation, io }))

        if (Battle_Brawlers_Game_State[roomIndex].turnState.turn === userId) {

            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "CHANGE_ATTRIBUTE")

            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType

            let abilityRequest = [...Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, ...Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, ...Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].find((action) => action.type === 'USE_ABILITY_CARD')

            if (abilityRequest) {
                AddAbilities({
                    attribut: target.attribut,
                    bakugan: target.key,
                    request: Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest,
                    roomState: Battle_Brawlers_Game_State[roomIndex],
                    slot: slot.id,
                    userId: userId,
                    bakuganAttribut: attribut
                })
            }

            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: Battle_Brawlers_Game_State[roomIndex], userId: userId })
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

        if (Battle_Brawlers_Game_State[roomIndex].turnState.turn !== userId) {
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "CHANGE_ATTRIBUTE")

            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: Battle_Brawlers_Game_State[roomIndex], userId: userId })
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