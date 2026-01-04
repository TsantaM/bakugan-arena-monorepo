import { type abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";
import { CancelGateCardDirectiveAnimation } from '../../function/create-animation-directives/cancel-gate-card'
import { PowerChangeDirectiveAnumation } from '../../function/create-animation-directives/power-change'
import type { bakuganOnSlot } from "../../type/room-types";
import { StandardCardsImages } from "../../store/ability-cards-images";

export const CoupDeGrace: abilityCardsType = {
    key: 'coup-de-grace',
    name: 'Coup de Grâce',
    attribut: 'Darkus',
    description: `Détruit la carte portail et en annule tous les effets, mais ne fonctionne que si la carte portail est ouverte`,
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
                    malus: false
                })
                opponent.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 100,
                    malus: true
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
                    malus: true
                })
                opponent.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 100,
                    malus: false
                })
            }
        }
    }
}


export const BoublierFusion: abilityCardsType = {
    key: 'bouclier-fusion',
    name: 'Bouclier Fusion',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Vole tous les boost obtenut par l'adversaire pendant le match`,
    image: StandardCardsImages.darkus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                const currentOpponentPower = opponent.currentPower
                const baseOpponentPower = opponent.powerLevel
                const opponentBoost = currentOpponentPower - baseOpponentPower
                if (opponentBoost > 0) {
                    user.currentPower += opponentBoost
                    PowerChangeDirectiveAnumation({
                        animations: roomState.animations,
                        bakugans: [user],
                        powerChange: opponentBoost,
                        malus: false
                    })
                }
            }
        }

        return null
    }
}


export const VengeanceAlItalienne: abilityCardsType = {
    key: `vengeance-a-l'italienne`,
    name: `Vengeance à l'Italienne`,
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Permet de retirer 100 G de puissances à tous les bakugans adverse et augmente le niveau de puissance de l'utilisateur de 100 G`,
    image: StandardCardsImages.darkus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
                let oppo: bakuganOnSlot[] = []
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                    oppo.push(opponent)
                })
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: oppo,
                    powerChange: 100,
                    malus: true
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
                opponent.currentPower -= 50
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 50,
                    malus: true
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
                opponent.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [opponent],
                    powerChange: 50,
                    malus: false
                })
            }
        }
    }
}