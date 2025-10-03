import { abilityCardsType } from "../../type/game-data-types";
import { bakuganOnSlot } from "../../type/room-types";
import { AbilityCardsList } from "../ability-cards";
import { ExclusiveAbilitiesList } from "../exclusive-abilities";

export const RapideHaos: abilityCardsType = {
    key: 'rapide-haos',
    name: 'Rapide Haos',
    attribut: 'Haos',
    description: `Permet à l'utilisateur d'ajouter un bakugan en plus sur le terrain s'il y a déjà un bakugan Haos sur la carte`,
    maxInDeck: 1,
    usable_in_neutral: false,
    extraInputs: ['add-bakugan'],
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
    usable_in_neutral: false,
    extraInputs: ['add-bakugan'],
    onActivate: ({ roomState, userId, bakuganKey, slot, bakuganToAdd }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const bakugan = deck?.bakugans.find((b) => b?.bakuganData.key === bakuganToAdd)
        if (slotOfGate && deck && bakugan) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Haos').map((b) => b.key)).flat()
            const newBakugan: bakuganOnSlot = {
                key: bakugan.bakuganData.key,
                userId: userId,
                powerLevel: bakugan.bakuganData.powerLevel,
                currentPower: bakugan.bakuganData.powerLevel,
                attribut: bakugan.bakuganData.attribut,
                image: bakugan.bakuganData.image,
                abilityBlock: false,
                assist: true,
                family: bakugan.bakuganData.family
            }

            if (user && haosOnDomain && haosOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
            }
        }
    },
    onCanceled({ roomState, userId, slot }) {
        const slotToUpdate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        if (slotToUpdate && deck) {
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.userId === userId && b.assist)

            assistsBakugans.forEach((a) => {
                const index = slotToUpdate.bakugans.findIndex((b) => b.key === a.key && b.assist === a.assist && b.userId === a.userId)
                slotToUpdate.bakugans.splice(index, 1)

                const deckDataToUpdate = deck.bakugans.find((b) => b?.bakuganData.key === a.key)
                if (deckDataToUpdate) {
                    deckDataToUpdate.bakuganData.onDomain = false
                }

            })

        }
    },
}

export const LumiereDivine: abilityCardsType = {
    key: 'lumiere-divine',
    name: 'Lumière Divine',
    maxInDeck: 1,
    attribut: 'Haos',
    description: `Permet de redonner vie à un Bakugan qui a été vaincu au combat`,
    usable_in_neutral: true,
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
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const lastAbility = slotOfGate.activateAbilities.find((a) => a.userId !== userId)

            if (lastAbility) {
                const ability = AbilityCardsList.find((a) => a.key === lastAbility.key)
                const exclusive = ExclusiveAbilitiesList.find((a) => a.key === lastAbility.key)

                if (ability && ability.onCanceled) ability.onCanceled({ roomState, bakuganKey: lastAbility.bakuganKey, slot: slot, userId: lastAbility.userId })
                if (exclusive && exclusive.onCanceled) exclusive.onCanceled({ roomState, bakuganKey: lastAbility.bakuganKey, slot: slot, userId: lastAbility.userId })
            }

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
    description: `Si deux (2) Bakugans Haos sont sur le domaine, ajoute 100 G de puissance à l'utilisateur et permet rendre 3 cartes capacités supplémentaires au joueur`,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans?.filter((b) => b.attribut === 'Haos').map((b) => b.key) || [])

        if (slotOfGate && haosOnDomain) {
            const merged = haosOnDomain.flat()
            if (merged.length >= 2 && slotOfGate) {
                const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
                const player = roomState?.players.find((p) => p.userId === userId)

                if (user && player) {
                    user.currentPower += 100
                    player.usable_abilitys = 3
                }
            }
        }
    },
    onCanceled: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower -= 100
            }
        }
    }
}