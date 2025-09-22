import { abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";

export const CoupDeGrace: abilityCardsType = {
    key: 'coup-de-grace',
    name: 'Coup de Grâce',
    attribut: 'Darkus',
    description: `Détruit la carte portail et en annule tous les effets, mais ne fonctionne que si la carte portail est ouverte`,
    maxInDeck: 2,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard?.key
            if (user && gate && slotOfGate.state.open) {
                const gateToCancel = GateCardsList.find((g) => g.key === gate)

                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }


            }
        }
    }
}


export const EpicesMortelles: abilityCardsType = {
    key: 'epices-mortelles',
    name: 'Epices Mortelles',
    maxInDeck: 1,
    attribut: 'Darkus',
    description: `Ajoute 100 G de puissance à l'utilisateur et en retire autant a les adversaires.`,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                user.currentPower += 100
                opponent.currentPower -= 100
            }
        }
    },
    onCanceled: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                user.currentPower -= 100
                opponent.currentPower += 100
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
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
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
                }
            }
        }
    }
}


export const VengeanceAlItalienne: abilityCardsType = {
    key: `vengeance-a-l'italienne`,
    name: `Vengeance à l'Italienne`,
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Permet de retirer 100 G de puissances à tous les bakugans adverse et augmente le niveau de puissance de l'utilisateur de 100 G`,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
            }
        }
    }
}


export const PoivreDesCayenne: abilityCardsType = {
    key: 'poivre-des-cayenne',
    name: 'Poivre des Cayenne',
    attribut: 'Darkus',
    maxInDeck: 2,
    description: `Annule toutes les capacité de l'adversaire et retire 50 G à l'adversaire`,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (opponent) {
                opponent.currentPower -= 50
            }
        }
    },
    onCanceled: ({ roomState, userId, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (opponent) {
                opponent.currentPower += 50
            }
        }
    }
}