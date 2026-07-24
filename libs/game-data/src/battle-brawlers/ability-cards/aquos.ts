import { AbilityCardsActions, slots_id, type abilityCardsType } from "../../type/type-index.js";
import { Slots, StandardCardsImages } from '../../store/store-index.js'
import { AbilityCardFailed, BlockAbilityCardsEffect, CancelGateCardDirectiveAnimation, CustomAnimationDirective, moveBakuganToSelectedSlot, PowerChange, RemoveAbilityCardsBlockEffect } from "../../function/index.js";
import { AbilityCardsList } from "../ability-cards.js";
import { ExclusiveAbilitiesList } from "../exclusive-abilities.js";
import { GateCardsList } from "../gate-gards.js";
import { NewAdditionnalMessage } from "../../function/new-additional-message.js";
import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    attribut: 'Aquos',
    maxInDeck: 2,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: 'mirage-aquatique.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ abilityKey: MirageAquatique.key })

        if (!roomState) return animation

        if (MirageAquatique.activationConditions) {
            const checker = MirageAquatique.activationConditions({ roomState, userId })
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
            message: { key: 'prompt_select_slot', params: { abilityKey: MirageAquatique.key } },
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData }) => {

        moveBakuganToSelectedSlot({ resolution: resolution, roomData: roomData, shouldBlockAlways: true })

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

        NewAdditionnalMessage({
            roomState: roomState,
            key: 'gate_unblocked',
        })


    },
    activationConditions({ roomState, userId }) {
        
        if (!roomState) return false
        const slotWithGate = roomState.protalSlots.filter((slot) => slot.portalCard !== null)

        if (slotWithGate.length < 2) return false
        return true

    },
    canUse({ bakugan, roomState }) {

        const slots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id && slot.portalCard !== null)

        if(slots.length === 0) return false
        if (bakugan.statut.trapped) return false
        
        return true

    },
}

export const BarrageDeau: abilityCardsType = {
    key: `barrage-d'eau`,
    maxInDeck: 1,
    attribut: 'Aquos',
    usable_in_neutral: true,
    image: StandardCardsImages.aquos,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const sourceBakugan = slotOfGate?.bakugans.find(
            (b) => b.key === bakuganKey && b.userId === userId,
        )

        CustomAnimationDirective({
            roomState,
            animationKey: BarrageDeau.key,
            sourceBakugan,
            slotId: slot,
        })

        BlockAbilityCardsEffect({ roomState, userId, bakuganKey, slot, card: BarrageDeau, turns: 1 })

        return null
    },
    onCanceled({ roomState }) {
        if (!roomState) return
        RemoveAbilityCardsBlockEffect({ roomState, card: BarrageDeau })
    },
}

export const BouclierAquos: abilityCardsType = {
    key: 'bouclier-aquos',
    attribut: 'Aquos',
    maxInDeck: 2,
    image: StandardCardsImages.aquos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }

        return null
    }
}

export const PlongeeEnEauProfonde: abilityCardsType = {
    key: 'plongee-en-eau-profonde',
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.aquos,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const AquosBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Aquos")
            const NotAquosBakugans = slotOfGate.bakugans.filter((b) => b.attribut !== "Aquos")

            AquosBakugans.forEach((bakugan) => {
                PowerChange({
                    bakugan: bakugan,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })
            })

            NotAquosBakugans.forEach((bakugan) => {

                PowerChange({
                    bakugan: bakugan,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })

            })

            // slotOfGate.activateAbilities.forEach((ability) => {
            //     const user = slotOfGate.bakugans.find((b) => b.key === ability.bakuganKey && b.userId === ability.userId)
            //     if (!user) return
            //     if (user.attribut === "Aquos") return
            //     CancelAbilityCardEffect({
            //         ability: ability,
            //         roomState: roomState,
            //         slotOfGate: slotOfGate,
            //     })
            // })

        }

        return null
    }
}

export const DepthDive: abilityCardsType = {
    key: 'depth-dive',
    attribut: 'Aquos',
    maxInDeck: 2,
    usable_in_neutral: false,
    image: StandardCardsImages.haos,
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
                    turn: roomState.turnState.turnCount,
                    roomState: roomState
                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }


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

export const FlowInterference: abilityCardsType = {
    key: 'flow-interference',
    attribut: 'Aquos',
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