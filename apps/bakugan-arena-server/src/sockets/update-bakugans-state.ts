import { Server, Socket } from "socket.io";
import {
    AbilityCardsList,
    ActivePlayerActionRequestType,
    attribut,
    BakuganList,
    bakuganOnSlot,
    ChangeAttributActionRequest,
    ExclusiveAbilitiesList,
    InactivePlayerActionRequestType,
    onBoardBakugans,
    removeActionByType,
    SelectAbilityCardFilters,
    SelectAbilityCardInNeutralFilters,
    setBakuganProps,
    Slots,
    slots_id,
    stateType,
} from "@bakugan-arena/game-data";
import { SetBakuganOnGate } from "../functions/set-bakugan-server";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import {
    emitRoomStateUpdate,
    emitToUserGameboard,
    runRoomSocketAction,
} from "../functions/room-runtime";

/**
 * Enrichit la request de tour avec les abilities utilisables après un pose bakugan.
 */
export function AddAbilities({
    roomState,
    request,
    bakugan,
    slot,
    userId,
    attribut,
    bakuganAttribut,
}: {
    roomState: stateType
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType
    bakugan: string
    slot: slots_id
    userId: string
    attribut: attribut
    bakuganAttribut?: attribut
}) {
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

    if (!bakuganOnDomain) return

    const abilities = [
        selectAbilitiesResult?.usableAbilities?.map((ability) => {
            const fullCard = AbilityCardsList.find((card) => card.key === ability.key)
            if (!fullCard) return undefined

            if (fullCard.canUse && !fullCard.canUse({ roomState, bakugan: bakuganOnDomain })) {
                return undefined
            }

            return {
                key: ability.key,
                image: fullCard.image || ''
            }
        }),

        selectAbilitiesResult?.usableExclusives?.filter((ability) => ability !== undefined).map((ability) => {
            const fullCard = ExclusiveAbilitiesList.find((card) => card.key === ability.key)
            if (!fullCard) return undefined

            if (fullCard.canUse && !fullCard.canUse({ roomState, bakugan: bakuganOnDomain })) {
                return undefined
            }

            return {
                key: ability.key,
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
    socket.on('set-bakugan', (payload: setBakuganProps & { actionSeq?: number | string }) => {
        const { roomId, bakuganKey, slot, userId, actionSeq } = payload

        runRoomSocketAction({
            socket,
            roomId,
            event: 'set-bakugan',
            actionSeq,
            userId,
            handler: (updatedState) => {
                if (updatedState.status.finished === true) return

                clearAnimationsInRoom(roomId)

                const bakugan = BakuganList.find((b) => b.key === bakuganKey)
                if (!bakugan) return

                const animation = SetBakuganOnGate({ roomId, bakuganKey, slot, userId })

                emitRoomStateUpdate(io, updatedState, "update-room-state")

                // Ne plus early-return si pas d'animation : sinon turn-request jamais renvoyé.
                if (animation && animation.length > 0) {
                    io.to(roomId).emit('animations', animation)
                    animation.forEach((a) => EmitMessage({ roomState: updatedState, animation: a, io }))
                }

                if (updatedState.turnState.turn === userId) {
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

                    const merged = [
                        updatedState.ActivePlayerActionRequest.actions.mustDo,
                        updatedState.ActivePlayerActionRequest.actions.mustDoOne,
                        updatedState.ActivePlayerActionRequest.actions.optional,
                    ].flat()

                    if (merged.length > 0) {
                        emitToUserGameboard(
                            io,
                            updatedState,
                            userId,
                            'turn-action-request',
                            updatedState.ActivePlayerActionRequest,
                            socket.id,
                        )
                        return
                    }

                    clearAnimationsInRoom(roomId)
                    turnActionUpdater({
                        roomId,
                        userId,
                        io,
                        fallbackSocketId: socket.id,
                    })
                    return
                }

                // Joueur inactif
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

                const merged = [
                    updatedState.InactivePlayerActionRequest.actions.mustDo,
                    updatedState.InactivePlayerActionRequest.actions.mustDoOne,
                    updatedState.InactivePlayerActionRequest.actions.optional,
                ].flat()

                const checker = CheckTurnActionRequest({ roomState: updatedState, userId: userId })
                if (!checker) return
                if (merged.length <= 0) return

                emitToUserGameboard(
                    io,
                    updatedState,
                    userId,
                    'turn-action-request',
                    updatedState.InactivePlayerActionRequest,
                    socket.id,
                )
            },
        })
    })
}
