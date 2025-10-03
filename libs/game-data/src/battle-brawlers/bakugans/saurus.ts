import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const SaurusPyrus: bakuganType = {
    key: 'saurus-pyrus',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Pyrus',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: []
}

export const SaurusSubterra: bakuganType = {
    key: 'saurus-subterra',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Subterra',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: []
}

export const SaurusHaos: bakuganType = {
    key: 'saurus-haos',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Haos',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: []
}

export const SaurusGateCard: gateCardType = {
    key: 'saurus-gate-card',
    name: 'Carte Personnage: Saurus',
    maxInDeck: 1,
    family: 'Saurus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Saurus présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'saurus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Saurus' })

    },
}