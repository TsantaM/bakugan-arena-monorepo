import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { SetBakuganOnGate } from "../functions/set-bakugan-server";
import { AbilityCardsList, ActivePlayerActionRequestType, attribut, BakuganList, bakuganOnSlot, ChangeAttributActionRequest, ExclusiveAbilitiesList, InactivePlayerActionRequestType, onBoardBakugans, removeActionByType, SelectAbilityCardFilters, SelectAbilityCardInNeutralFilters, setBakuganProps, Slots, slots_id, stateType } from "@bakugan-arena/game-data";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";


export function AddAbilities({ roomState, request, bakugan, slot, userId, attribut, bakuganAttribut }: { roomState: stateType, request: ActivePlayerActionRequestType | InactivePlayerActionRequestType, bakugan: string, slot: slots_id, userId: string, attribut: attribut, bakuganAttribut?: attribut }) {
    if (!roomState) return

    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)

    let selectAbilitiesResult

    if (roomState.battleState.battleInProcess && roomState.battleState.slot !== null && !roomState.battleState.paused) {
        const changedSlot = roomState.protalSlots[Slots.indexOf(slot)]
        const battleSlot = roomState.protalSlots[Slots.indexOf(roomState.battleState.slot)]
        const slotOfBattle = changedSlot ?? battleSlot

        selectAbilitiesResult = SelectAbilityCardFilters({
            bakuganKey: bakugan,
            playersDeck: activePlayer,
            slotOfBattle: slotOfBattle,
            userId: userId,
            roomState: roomState,
            bakuganAttribut: bakuganAttribut
        })
    } else {
        selectAbilitiesResult = SelectAbilityCardInNeutralFilters({
            bakuganKey: bakugan,
            bakuganToSet: bakugan,
            slots: roomState.protalSlots,
            decksState: roomState.decksState,
            userId: userId,
            roomState: roomState
        })
    }

    const bakuganOnDomain: bakuganOnSlot | undefined =
        roomState.protalSlots[Slots.indexOf(slot)].bakugans.find(
            (b) => b.userId === userId && b.key === bakugan
        )

    roomState.protalSlots[Slots.indexOf(slot)]
        .bakugans.find((b) => b.userId === userId && b.key === bakugan)

    if (!bakuganOnDomain) return

    const abilities = [
        selectAbilitiesResult?.usableAbilities?.map((ability) => {
            const fullCard = AbilityCardsList.find((card) => card.key === ability.key)
            if (!fullCard) return undefined

            // 🔥 CHECK canUse
            if (fullCard.canUse && !fullCard.canUse({ roomState, bakugan: bakuganOnDomain })) {
                return undefined
            }

            return {
                key: ability.key,
                name: ability.name,
                description: ability.description,
                image: fullCard.image || ''
            }
        }),

        selectAbilitiesResult?.usableExclusives?.filter((ability) => ability !== undefined).map((ability) => {
            const fullCard = ExclusiveAbilitiesList.find((card) => card.key === ability.key)
            if (!fullCard) return undefined

            // 🔥 CHECK canUse
            if (fullCard.canUse && !fullCard.canUse({ roomState, bakugan: bakuganOnDomain })) {
                return undefined
            }

            return {
                key: ability.key,
                name: ability.name,
                description: ability.description,
                image: fullCard.image || ''
            }
        })
    ]
        .flat()
        .filter((ability) => ability !== undefined)

    const abilitieRequest: onBoardBakugans = {
        slot: slot,
        bakuganKey: bakugan,
        abilities: abilities,
        attribut: attribut
    }

    console.log(abilitieRequest.abilities.map((a) => a.key))

    const abilitiesList = abilitieRequest.abilities.map((a) => a)
    if (abilitiesList.length === 0) return

    let requests = [...request.actions.mustDo, ...request.actions.mustDoOne, ...request.actions.optional].find((action) => action.type === 'USE_ABILITY_CARD')

    if (requests) {
        requests.data.push(abilitieRequest)
    } else {
        request.actions.optional.push({
            type: "USE_ABILITY_CARD",
            data: [abilitieRequest]

        })
    }

}

export const socketUpdateBakuganState = (io: Server, socket: Socket) => {
    socket.on('set-bakugan', ({ roomId, bakuganKey, slot, userId }: setBakuganProps) => {

        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        if (state.status.finished === true) return

        clearAnimationsInRoom(roomId)

        const bakugan = BakuganList.find((b) => b.key === bakuganKey)

        if (!bakugan) return

        const animation = SetBakuganOnGate({ roomId, bakuganKey, slot, userId })

        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
        if (roomIndex === -1) return

        const updatedState = Battle_Brawlers_Game_State[roomIndex]
        if (!updatedState) return

        io.to(roomId).emit('update-room-state', updatedState)
        if (!animation) return
        io.to(roomId).emit('animations', animation)
        animation.forEach((a) => EmitMessage({ roomState: updatedState, animation: a, io }))

        const activeSocket = updatedState.connectedsUsers.get(updatedState.turnState.turn)
        const inactiveSocket = updatedState.connectedsUsers.get(updatedState.turnState.previous_turn || '')

        if (updatedState.turnState.turn === userId) {
            if (!activeSocket) return

            const newState = removeActionByType(updatedState.ActivePlayerActionRequest, "SET_BAKUGAN")
            updatedState.ActivePlayerActionRequest = newState as ActivePlayerActionRequestType

            const removeSetGateCard = removeActionByType(updatedState.ActivePlayerActionRequest, "SET_GATE_CARD_ACTION")
            updatedState.ActivePlayerActionRequest = removeSetGateCard as ActivePlayerActionRequestType

            AddAbilities({
                bakugan: bakuganKey,
                request: updatedState.ActivePlayerActionRequest,
                roomState: updatedState,
                slot: slot as slots_id,
                userId: userId,
                attribut: bakugan.attribut
            })

            ChangeAttributActionRequest({ roomState: updatedState })

            const checker = CheckTurnActionRequest({ roomState: updatedState, userId: userId })
            if (!checker) return

            const merged = [updatedState.ActivePlayerActionRequest.actions.mustDo, updatedState.ActivePlayerActionRequest.actions.mustDoOne, updatedState.ActivePlayerActionRequest.actions.optional].flat()
            if (merged.length > 0) {
                io.to(activeSocket.gameboardSocket).emit('turn-action-request', updatedState.ActivePlayerActionRequest)
                return
            } else {
                clearAnimationsInRoom(roomId)
                turnActionUpdater({ roomId, userId, io })
            }
        }

        if (updatedState.turnState.turn !== userId) {
            if (!inactiveSocket) return

            const newState = removeActionByType(updatedState.InactivePlayerActionRequest, "SET_BAKUGAN")
            updatedState.InactivePlayerActionRequest = newState as InactivePlayerActionRequestType

            AddAbilities({
                bakugan: bakuganKey,
                request: updatedState.InactivePlayerActionRequest,
                roomState: updatedState,
                slot: slot as slots_id,
                userId: userId,
                attribut: bakugan.attribut
            })

            const merged = [updatedState.InactivePlayerActionRequest.actions.mustDo, updatedState.InactivePlayerActionRequest.actions.mustDoOne, updatedState.InactivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: updatedState, userId: userId })
            if (!checker) return

            if (merged.length <= 0) return
            io.to(inactiveSocket.gameboardSocket).emit('turn-action-request', updatedState.InactivePlayerActionRequest)
        }

    })
}