import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";
import { AbilityCardFailed, CancelGateCardDirectiveAnimation, CheckBattleStillInProcess, ComeBackBakuganDirectiveAnimation, dragBakuganToUserSlot, moveBakuganToSelectedSlot, moveSelectedBakugan } from "../../function/index.js";
import { StandardCardsImages } from "../../store/ability-cards-images.js";
import { Slots } from "../../store/slots.js";
import type { AbilityCardsActions, abilityCardsType, bakuganToMoveType2 as bakuganToMoveType, slots_id } from "../../type/type-index.js";
import { GateCardsList } from "../gate-gards.js";
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js";

export const CombatAerien: abilityCardsType = {
    key: 'combat-aerien',
    name: 'Air Battle',
    attribut: 'Ventus',
    description: `Move your Ventus Bakugan from its current slot to another slot with a gate card placed. Can be used outside of battle. Requires at least two slots with a gate card placed and your Bakugan must not be trapped. If you move to an opponent's slot whose gate card has not opened yet, this card prevents that gate card from opening until this card is nullified.`,
    maxInDeck: 1,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: StandardCardsImages.ventus,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        const animation = AbilityCardFailed({ card: CombatAerien.name })

        if (!roomState) return animation

        if (CombatAerien.activationConditions) {
            const checker = CombatAerien.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }


        const opponentsUsableBakugans = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans.filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain)
        const opponentBakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.slot_id !== slot && bakugan.userId !== userId)

        if ((opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length === 0)) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

        const slots: slots_id[] = opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length > 0 ? opponentBakugansOnField.map((bakugan) => bakugan.slot_id) : roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)

        if (slots.length <= 0) return animation

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Air Battle : Select a slot',
            slots: slots
        }

        return request

    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null

        const user = slotOfGate.bakugans.find((b) => b.userId === userId && b.key === bakuganKey)
        if (!user) return null

        const slotState = slotOfGate.state
        if (!slotState) return null
        if (!slotState.blocked) return null

        slotState.blocked = false

    },
    onAdditionalEffect: ({ resolution, roomData }) => {
        moveBakuganToSelectedSlot({ resolution: resolution, roomData: roomData, shouldBlockAlways: true })
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const slotWithGate = roomState.protalSlots.filter((slot) => slot.portalCard !== null)

        if (slotWithGate.length < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {

        const slots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id && slot.portalCard !== null)

        if (slots.length === 0) return false
        if (bakugan.statut.trapped) return false

        return true
    },
}

export const TornadeChaosTotal: abilityCardsType = {
    key: 'tornade-chaos-total',
    name: 'Storm Breaker',
    maxInDeck: 1,
    attribut: 'Ventus',
    description: `During battle on the battle slot, this card nullifies the opponent's open gate card on that slot if it has not already been canceled. Requires the opponent's gate card to be open on the battle slot.`,
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
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount

                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                }

                slotOfGate.state.canceled = true

            }
        }

        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess) return false
        if (battleInProcess && paused) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot } = roomState.battleState
        if (!battleInProcess) return false
        if (battleInProcess && paused) return false
        if (slot === null) return false

        const slotOfBakugan = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfBakugan.portalCard === null) return false
        if (slotOfBakugan.portalCard.userId === bakugan.userId) return false
        if (!slotOfBakugan.state.open) return false
        if (slotOfBakugan.state.canceled) return false

        const card = GateCardsList.find((c) => c.key === slotOfBakugan.portalCard?.key)
        if (!card) return false
        if (!card.onCanceled) return false

        return true
    },
}

export const SouffleTout: abilityCardsType = {
    key: 'souffle-tout',
    name: 'Blow Away',
    attribut: 'Ventus',
    description: `During battle on the battle slot, this card moves one opponent Bakugan from the battle slot to another slot with a gate card placed. The target cannot be trapped or protected against ability cards. Requires at least two slots with a gate card placed and at least two Bakugan on the battle slot.`,
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
        if (slotOfGate.bakugans.length < 2) return animation
        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = slotOfGate.bakugans.filter((b) => b.userId !== userId).filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected).map((b) => ({
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

        const slotWithCard = roomState.protalSlots.filter((slot) => slot.portalCard !== null).length
        if (slotWithCard < 2) return false

        return true
    },
    canUse({ bakugan, roomState }) {
        if (!roomState) return false
        const slotOfBakugan = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slotOfBakugan) return false
        if (slotOfBakugan.id !== roomState.battleState.slot) return false
        if (slotOfBakugan.bakugans.length < 2) return false
        const otherBakugans = slotOfBakugan.bakugans.filter((b) => b.key !== bakugan.key && b.userId !== bakugan.userId).filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)
        if (otherBakugans.length < 1) return false
        return true
    }
}

export const RetourDair: abilityCardsType = {
    key: 'retour-d-air',
    name: `Backdraft`,
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `This card removes your Bakugan from its slot and returns it to your deck. Can be used outside of battle.`,
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
    description: `This card pulls one Bakugan from a slot with a gate card placed onto your Bakugan's slot. Can be used outside of battle. Requires at least two slots with a gate card placed, at least two Bakugan on the field, and a target that is not trapped or protected against ability cards.`,
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

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)

        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        if (bakugans.length === 0) {
            return animation
        }


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
        const slotWithCard = roomState.protalSlots.filter((slot) => slot.portalCard !== null).length
        if (slotWithCard < 2) return false
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {

        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id).map((slot) => slot.bakugans).flat().filter((b) => !b.statut.trapped && !b.statut.protected && !b.statut.protectedAgainstAbility).length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}

export const StormCancel: abilityCardsType = {
    key: 'storm-cancel',
    attribut: 'Ventus',
    name: 'Storm Cancel',
    description: `During battle on the battle slot, this card nullifies all opponent ability cards currently active on that slot. Requires at least one cancelable opponent ability card in play on that slot.`,
    maxInDeck: 3,
    image: StandardCardsImages.haos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, slot, cardToCancel }) => {
        return ElementaryCardCancelerEffect({ roomState, userId, slot, cardToCancel })
    },
    activationConditions({ roomState, userId }) {

        if (!roomState) return false

        const { battleInProcess, paused, slot, turns } = roomState.battleState

        if (!battleInProcess || paused) return false

        return true

    },
    canUse({ roomState, bakugan }) {

        if (!roomState) return false

        const { battleInProcess, paused, slot, turns } = roomState.battleState

        if (!battleInProcess || paused) return false

        if (bakugan.slot_id !== slot) return false

        const slotOfBattle = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfBattle) return false

        const lists = [AbilityCardsList, ExclusiveAbilitiesList].flat()

        const abilities = slotOfBattle.activateAbilities.filter((ability) => {
            return (
                !ability.canceled &&
                ability.userId !== bakugan.userId &&
                lists.some((a) => a.key === ability.key && a.onCanceled)
            );
        });

        if (abilities.length < 1) return false

        return true
    },
}