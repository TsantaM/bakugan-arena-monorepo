import { bakuganOnSlot, type abilityCardsType } from "../../type/type-index.js";
import { GateCardsList } from "../gate-gards.js";
import { CancelGateCardDirectiveAnimation, PowerChange, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { Slots, StandardCardsImages } from "../../store/store-index.js";
import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js";

export const CoupDeGrace: abilityCardsType = {
    key: 'coup-de-grace',
    name: 'Grand Down',
    attribut: 'Darkus',
    description: `Nullifies the opponent's Gate Card`,
    maxInDeck: 2,
    usable_in_neutral: false,
    image: StandardCardsImages.darkus,
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
                    animationsForReplay: roomState.animationsForReplay
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
        if(slot === null) return false

        const slotOfBakugan = roomState.protalSlots[Slots.indexOf(slot)]
        if(slotOfBakugan.portalCard === null) return false
        if(slotOfBakugan.portalCard.userId === bakugan.userId) return false 
        if(!slotOfBakugan.state.open) return false
        if(slotOfBakugan.state.canceled) return false

        const card = GateCardsList.find((c) => c.key === slotOfBakugan.portalCard?.key)
        if(!card) return false
        if(!card.onCanceled) return false

        return true
    },
}

export const EpicesMortelles: abilityCardsType = {
    key: 'epices-mortelles',
    name: 'Epices Mortelles',
    maxInDeck: 1,
    attribut: 'Darkus',
    description: `Ajoute 100 G de puissance à l'utilisateur et en retire autant a les adversaires.`,
    image: StandardCardsImages.darkus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false,
                    turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

                })
                opponent.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 100,
                    malus: true,
                    turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

                })
            }
        }

        return null
    },
    onCanceled: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                user.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: true,
                    turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay


                })
                opponent.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 100,
                    malus: false,
                    turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

                })
            }
        }
    }
}

export const VengeanceAlItalienne: abilityCardsType = {
    key: `vengeance-a-l'italienne`,
    name: `Auragano Revenge`,
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Substract 100 Gs from each opponent and adds 100 Gs to the user`,
    image: StandardCardsImages.darkus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

                opponents.forEach((opponent) => {
                    PowerChange({
                        bakugan: opponent,
                        G: 100,
                        malus: true,
                        roomState: roomState
                    })
                })
            }
        }

        return null
    }
}

export const PoivreDesCayenne: abilityCardsType = {
    key: 'poivre-des-cayenne',
    name: 'Poivre des Cayenne',
    attribut: 'Darkus',
    maxInDeck: 2,
    description: `Annule toutes les capacité de l'adversaire et retire 50 G à l'adversaire`,
    image: StandardCardsImages.darkus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (opponent) {
                PowerChange({
                    bakugan: opponent,
                    G: 50,
                    malus: true,
                    roomState: roomState
                })
            }
        }

        return null
    },
    onCanceled: ({ roomState, userId, slot }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (opponent) {
                PowerChange({
                    bakugan: opponent,
                    G: 50,
                    malus: false,
                    roomState: roomState
                })
            }
        }
    }
}

export const ShadowReversal: abilityCardsType = {
    key: 'shadow-reversal',
    attribut: 'Darkus',
    name: 'Shadow Reversal',
    description: `Nullifies the opponent's ability`,
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