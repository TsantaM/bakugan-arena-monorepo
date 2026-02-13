import { AbilityCardFailed, CancelGateCardDirectiveAnimation, CheckBattleStillInProcess, ComeBackBakuganDirectiveAnimation, dragBakuganToUserSlot, moveBakuganToSelectedSlot, moveSelectedBakugan, MoveToAnotherSlotDirectiveAnimation, OpenGateCardActionRequest } from "../../function/index.js";
import { StandardCardsImages } from "../../store/ability-cards-images.js";
import type { AbilityCardsActions, abilityCardsType, bakuganOnSlot, bakuganToMoveType2 as bakuganToMoveType, slots_id } from "../../type/type-index.js";
import { GateCardsList } from "../gate-gards.js";

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
        moveBakuganToSelectedSlot({ resolution: resolution, roomData: roomData, shouldBlockAlways: true })
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
        const animation = AbilityCardFailed({ card: SouffleTout.name })

        if (!roomState) return animation

        if (SouffleTout.activationConditions) {
            const checker = SouffleTout.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        if (!roomState) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation
        if (!slotOfGate) return animation

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = slotOfGate.bakugans.filter((b) => b.userId !== userId).map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return animation

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Blow Away : Select the Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        moveSelectedBakugan({ resolution: resolution, roomState: roomState, requireUserOnSlot: true })
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false

        const { battleInProcess, paused } = roomState.battleState

        if (!battleInProcess || (battleInProcess && paused)) return false

        return true
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
        const animation = AbilityCardFailed({ card: TornadeExtreme.name })

        if (!roomState) return animation

        if (TornadeExtreme.activationConditions) {
            const checker = TornadeExtreme.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        if (!roomState) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

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
        dragBakuganToUserSlot({ resolution: resolution, roomState: roomState })
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    }
}
