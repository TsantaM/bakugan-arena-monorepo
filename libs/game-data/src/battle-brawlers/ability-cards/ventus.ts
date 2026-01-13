import { CancelGateCardDirectiveAnimation } from "../../function/create-animation-directives/cancel-gate-card";
import { ComeBackBakuganDirectiveAnimation } from "../../function/create-animation-directives/come-back-bakugan";
import { StandardCardsImages } from "../../store/ability-cards-images";
import type { AbilityCardsActions, bakuganToMoveType } from "../../type/actions-serveur-requests";
import { type abilityCardsType } from "../../type/game-data-types";
import type { bakuganOnSlot, slots_id } from "../../type/room-types";
import { GateCardsList } from "../gate-gards";
import { MoveToAnotherSlotDirectiveAnimation } from "../../function/create-animation-directives/move-to-another-slot";
import { OpenGateCardActionRequest } from "../../function/action-request-functions/open-gate-card-action-request";
import { CheckBattleStillInProcess } from "../../function/check-battle-still-in-process";

export const CombatAerien: abilityCardsType = {
    key: 'combat-aerien',
    name: 'Air Battle',
    attribut: 'Ventus',
    description: `Allow Ventus bakugan to fly beyond Gate Cards and nullifies the Gate Card that it land on`,
    maxInDeck: 1,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: StandardCardsImages.ventus,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        const opponentsUsableBakugans = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans.filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain)
        const opponentBakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.slot_id !== slot && bakugan.userId !== userId)

        if ((opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length === 0)) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots: slots_id[] = opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length > 0 ? opponentBakugansOnField.map((bakugan) => bakugan.slot_id) : roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Air Battle : Select a slot',
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData }) => {

        if (!roomData) return
        if (resolution.data.type !== 'SELECT_SLOT') return
        const destination = resolution.data.slot
        const slotOfGate = roomData.protalSlots.find((s) => s.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId))
        const slotTarget = roomData.protalSlots.find((s) => s.id === destination)
        if (slotOfGate && slotTarget && slotTarget.portalCard !== null) {
            const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === user?.key && ba.userId === user.userId)
            if (user) {
                const newUserState: bakuganOnSlot = {
                    ...user,
                    slot_id: destination
                }
                slotTarget.bakugans.push(newUserState)
                slotTarget.state.blocked = true
                slotOfGate.bakugans.splice(index, 1)

                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomData.animations,
                    bakugan: user,
                    initialSlot: structuredClone(slotOfGate),
                    newSlot: structuredClone(slotTarget)
                })

                CheckBattleStillInProcess(roomData)
                OpenGateCardActionRequest({ roomState: roomData })

                return {
                    turnActionLaucher: true
                }
            }
        }


    }
}

export const TornadeChaosTotal: abilityCardsType = {
    key: 'tornade-chaos-total',
    name: 'Storm Breaker',
    maxInDeck: 1,
    attribut: 'Ventus',
    description: `Nullifies the opponent's Gate Card`,
    image: StandardCardsImages.ventus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard?.key
            if (user && gate && slotOfGate.state.open) {
                const gateToCancel = GateCardsList.find((g) => g.key === gate)
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate
                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }

            }
        }

        return null
    }
}

export const SouffleTout: abilityCardsType = {
    key: 'souffle-tout',
    name: 'Blow Away',
    attribut: 'Ventus',
    description: `Move the opponent to another Gate Card`,
    maxInDeck: 3,
    extraInputs: ["move-opponent"],
    image: StandardCardsImages.ventus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!slotOfGate) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = slotOfGate.bakugans.filter((b) => b.userId !== userId).map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Blow Away : Select the Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (resolution.data.type !== 'MOVE_BAKUGAN_TO_ANOTHER_SLOT') return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot)
        const { data } = resolution

        if (slotOfGate && roomState) {
            const bakugans = roomState.protalSlots.map((b) => b.bakugans).flat()
            const opponent = bakugans.find((b) => b.userId === data.bakugan.userId && b.key === data.bakugan.key)
            const initialSlot = roomState.protalSlots.find((slot) => slot.id === opponent?.slot_id)
            const index = initialSlot?.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === data.slot)

            if (opponent && slotTarget && slotTarget.portalCard !== null && index !== undefined && index >= 0 && initialSlot) {

                const newOpponentState: bakuganOnSlot = {
                    ...opponent,
                    slot_id: data.slot
                }

                slotTarget.bakugans.push(newOpponentState)
                initialSlot.bakugans.splice(index, 1)

                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: opponent,
                    initialSlot: structuredClone(initialSlot),
                    newSlot: structuredClone(slotTarget)
                })

                CheckBattleStillInProcess(roomState)
                OpenGateCardActionRequest({ roomState })

                return {
                    turnActionLaucher: true
                }
            }
        }
    }
}

export const RetourDair: abilityCardsType = {
    key: 'retour-d-air',
    name: `Backdraft`,
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Remove the user from the field`,
    image: StandardCardsImages.ventus,
    usable_in_neutral: true,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === user?.key && ba.userId === user.userId)
            const bakuganInDeck = roomState?.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)

            if (user && bakuganInDeck) {
                slotOfGate.bakugans.splice(index, 1)
                bakuganInDeck.bakuganData.onDomain = false
                ComeBackBakuganDirectiveAnimation({
                    animations: roomState.animations,
                    bakugan: user,
                    slot: slotOfGate
                })
            }

            CheckBattleStillInProcess(roomState)

        }

        return null
    }
}

export const TornadeExtreme: abilityCardsType = {
    key: 'tornade-extreme',
    name: 'Scarlet Twister',
    attribut: 'Ventus',
    description: `Attract one Bakugan from another Gate Card to user's Gate Card`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    image: StandardCardsImages.ventus,
    usable_in_neutral: true,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Scarlet Twister : Select a Bakugan to drag',
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slotOfGate.id
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: bakuganToDrag,
                    initialSlot: slotTarget,
                    newSlot: slotOfGate
                })
                CheckBattleStillInProcess(roomState)
                OpenGateCardActionRequest({ roomState })

            }
        }
    }
}