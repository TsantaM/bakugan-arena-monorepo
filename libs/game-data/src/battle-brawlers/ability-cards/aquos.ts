import { AbilityCardsActions, AnimationDirectivesTypes, slots_id, type abilityCardsType } from "../../type/type-index.js";
import { Slots, StandardCardsImages } from '../../store/store-index.js'
import { AbilityCardFailed, BlockAbilityCardsEffect, CancelGateCardDirectiveAnimation, moveBakuganToSelectedSlot, PowerChange, PowerChangeDirectiveAnumation, RemoveAbilityCardsBlockEffect } from "../../function/index.js";
import { AbilityCardsList } from "../ability-cards.js";
import { ExclusiveAbilitiesList } from "../exclusive-abilities.js";
import { BakuganList } from "../bakugans.js";
import { GateCardsList } from "../gate-gards.js";
import { NewAdditionnalMessage } from "../../function/new-additional-message.js";
import { CancelAbilityCardEffect } from "../../function/ability-cards-effects/cancel-ability-card-effect.js";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    name: 'Dive Mirage',
    attribut: 'Aquos',
    description: `Move an Aquos Bakugan from one gate card to another, also it prevents the opponent's gate card from opening`,
    maxInDeck: 2,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: 'mirage-aquatique.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ card: MirageAquatique.name })

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
            message: 'Dive Mirage : Select a slot',
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
            text: `Card card is unblocked.`
        })


    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const slotWithGate = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        const opponentDeck = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans
        if (!opponentDeck) return false

        const opponentsBakugans = opponentDeck.filter((bakugan) => bakugan !== undefined && !bakugan?.bakuganData.onDomain && !bakugan?.bakuganData.elimined).length

        if (opponentsBakugans < 1) return false

        if (slotWithGate.length < 2) return false
        return true
    }
}

export const BarrageDeau: abilityCardsType = {
    key: `barrage-d'eau`,
    name: `Water Refrain`,
    maxInDeck: 1,
    attribut: 'Aquos',
    usable_in_neutral: true,
    image: StandardCardsImages.aquos,
    description: `This card prevents all players from using any abilities for 1 turn.`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
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
    description: 'Protège contre toute capacité adverse pendant le tour',
    maxInDeck: 2,
    name: 'Bouclier Aquos',
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
    name: 'Deap Sea Dive',
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.aquos,
    description: `Add 100 Gs to all Aquos Bakugans, substract 100 Gs to all not Aquos Bakugans and cancel not Aquos abilities.`,
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

            slotOfGate.activateAbilities.forEach((ability) => {
                const user = slotOfGate.bakugans.find((b) => b.key === ability.bakuganKey && b.userId === ability.userId)
                if (!user) return
                if (user.attribut === "Aquos") return
                CancelAbilityCardEffect({
                    ability: ability,
                    roomState: roomState,
                    slotOfGate: slotOfGate,
                })
            })

        }

        return null
    }
}

export const DepthDive: abilityCardsType = {
    key: 'depth-dive',
    name: 'Depth Dive',
    attribut: 'Aquos',
    description: `Nullifies the opponent's Gate Card`,
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
                    turn: roomState.turnState.turnCount
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