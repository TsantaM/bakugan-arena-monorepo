import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const MantrisPyrus: bakuganType = {
    key: 'mantris-pyrus',
    name: 'Mantris',
    attribut: 'Pyrus',
    image:'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles']
}

export const MantrisDarkus: bakuganType = {
    key: 'mantris-darkus',
    name: 'Mantris',
    attribut: 'Darkus',
    image:'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles']
}

export const MantrisHaos: bakuganType = {
    key: 'mantris-haos',
    name: 'Mantris',
    attribut: 'Haos',
    image:'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles']
}

export const MantrisSubterra: bakuganType = {
    key: 'mantris-subterra',
    name: 'Mantris',
    attribut: 'Subterra',
    image:'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles']
}

export const MantrisGateCard: gateCardType = {
    key: 'mantris-gate-card',
    name: 'Carte Personnage: Mantris',
    maxInDeck: 1,
    family: 'Mantris',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Mantris présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'mantris-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Mantris' })

    },
}