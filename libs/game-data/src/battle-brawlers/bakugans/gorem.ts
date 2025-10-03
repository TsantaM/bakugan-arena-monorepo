import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const GoremSubterra: bakuganType = {
    key: 'gorem-subterra',
    name: 'Gorem',
    attribut: 'Subterra',
    image: 'gorem',
    powerLevel: 380,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur']
}

export const HammerGoremSubterra: bakuganType = {
    key: 'hammer-gorem-subterra',
    name: 'Hammer Gorem',
    attribut: 'Subterra',
    image: 'gorem-hammer',
    powerLevel: 450,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur']
}

export const GoremGateCard: gateCardType = {
    key: 'gorem-gate-card',
    name: 'Carte Personnage: Gorem',
    maxInDeck: 1,
    family: 'Gorem',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Gorem présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Gorem' })

    },
}