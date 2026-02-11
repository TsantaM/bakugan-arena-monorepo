import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { SetBakuganOnGate } from "../functions/set-bakugan-server";
import { AbilityCardsList, ActivePlayerActionRequestType, attribut, BakuganList, ExclusiveAbilitiesList, InactivePlayerActionRequestType, onBoardBakugans, removeActionByType, SelectAbilityCardFilters, SelectAbilityCardInNeutralFilters, setBakuganProps, Slots, slots_id, stateType } from "@bakugan-arena/game-data";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";


export function AddAbilities({ roomState, request, bakugan, slot, userId, attribut }: { roomState: stateType, request: ActivePlayerActionRequestType | InactivePlayerActionRequestType, bakugan: string, slot: slots_id, userId: string, attribut: attribut }) {
    if (!roomState) return
    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)

    let selectAbilitiesResult

    if (roomState.battleState.battleInProcess && roomState.battleState.slot !== null && !roomState.battleState.paused) {
        selectAbilitiesResult = SelectAbilityCardFilters({
            bakuganKey: bakugan,
            playersDeck: activePlayer,
            slotOfBattle: roomState.protalSlots[Slots.indexOf(roomState.battleState.slot)],
            userId: userId,
            roomState: roomState
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
    const abilities = [
        selectAbilitiesResult && selectAbilitiesResult.usableAbilities && selectAbilitiesResult.usableAbilities.map((ability) => ({
            key: ability.key,
            name: ability.name,
            description: ability.description,
            image: AbilityCardsList.find((card) => card.key === ability.key)?.image || ''
        })),
        selectAbilitiesResult && selectAbilitiesResult.usableExclusives && selectAbilitiesResult.usableExclusives.filter((ability) => ability !== undefined).map((ability) => ({
            key: ability.key,
            name: ability.name,
            description: ability.description,
            image: ExclusiveAbilitiesList.find((card) => card.key === ability.key)?.image || ''
        }))].flat().filter((ability) => ability !== undefined)

    const abilitieRequest: onBoardBakugans = {
        slot: slot,
        bakuganKey: bakugan,
        abilities: abilities,
        attribut: attribut
    }

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
        clearAnimationsInRoom(roomId)

        const bakugan = BakuganList.find((b) => b.key === bakuganKey)

        if (!bakugan) return

        const animation = SetBakuganOnGate({ roomId, bakuganKey, slot, userId })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return

        if (state) {
            io.to(roomId).emit('update-room-state', state)
            if (!animation) return
            io.to(roomId).emit('animations', animation)
        }

        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        if (state.turnState.turn === userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!activeSocket) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return

            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SET_BAKUGAN")

            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType

            AddAbilities({
                bakugan: bakuganKey,
                request: Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest,
                roomState: Battle_Brawlers_Game_State[roomIndex],
                slot: slot as slots_id,
                userId: userId,
                attribut: bakugan.attribut
            })

            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            if (merged.length > 0) {
                console.log('still his turn')
                io.to(activeSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                return
            } else {
                console.log('change turn')
                clearAnimationsInRoom(roomId)
                turnActionUpdater({ roomId, userId, io })
            }
        }

        if (state.turnState.turn !== userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            if (!inactiveSocket) return

            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "SET_BAKUGAN")

            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType

            AddAbilities({
                bakugan: bakuganKey,
                request: Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest,
                roomState: Battle_Brawlers_Game_State[roomIndex],
                slot: slot as slots_id,
                userId: userId,
                attribut: bakugan.attribut
            })

            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()
            if (merged.length <= 0) return
            io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
        }
    })
}