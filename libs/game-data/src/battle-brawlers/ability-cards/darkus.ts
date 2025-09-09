import { abilityCardsType } from "../../type/game-data-types";

export const CoupDeGrace: abilityCardsType = {
    key: 'coup-de-grace',
    name: 'Coup de Grâce',
    attribut: 'Darkus',
    description: `Détruit la carte portail et en annule tous les effets, mais ne fonctionne que si la carte portail est ouverte`,
    maxInDeck: 2,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
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
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
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
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
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
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
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
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}