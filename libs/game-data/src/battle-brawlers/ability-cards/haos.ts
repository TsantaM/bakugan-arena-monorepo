import { abilityCardsType } from "../../type/game-data-types";

export const RapideHaos: abilityCardsType = {
    key: 'rapide-haos',
    name: 'Rapide Haos',
    attribut: 'Haos',
    description: `Permet à l'utilisateur d'ajouter un bakugan en plus sur le terrain s'il y a déjà un bakugan Haos sur la carte`,
    maxInDeck: 1,
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

export const EclatSoudain: abilityCardsType = {
    key: 'eclat-soudain',
    name: 'Eclat Soudain',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Permet d'ajouter un Bakugan Haos en plus dans un combat, mais le bakugan ajouté se retire si Eclat Soudain est annulée`,
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

export const LumiereDivine: abilityCardsType = {
    key: 'lumiere-divine',
    name: 'Lumière Divine',
    maxInDeck: 1,
    attribut: 'Haos',
    description: `Permet de redonner vie à un Bakugan qui a été vaincu au combat`,
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


export const ContreMaitrise: abilityCardsType = {
    key: 'contre-maîtrise',
    attribut: 'Haos',
    name: 'Contre Maîtrise',
    description: `Annule toute carte maitrise utilisé par l'adversaire`,
    maxInDeck: 3,
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


export const HaosImmobilisation: abilityCardsType = {
    key: 'haos-immobilisation',
    name: 'Haos Immobilisation',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Si trois Bakugans Haos sont sur le domaine, ajoute 100 G de puissance à l'utilisateur et permet rendre 3 cartes capacités supplémentaires au joueur`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans?.filter((b) => b.attribut === 'Haos').map((b) => b.key) || [])

        if (slotOfGate && haosOnDomain) {
            const merged = haosOnDomain.flat()
            if (merged.length >= 3 && slotOfGate) {
                const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
                const player = roomState?.players.find((p) => p.userId === userId)

                if (user && player) {
                    user.currentPower += 100
                    player.usable_abilitys = 3
                }
            }
        }
    }
}