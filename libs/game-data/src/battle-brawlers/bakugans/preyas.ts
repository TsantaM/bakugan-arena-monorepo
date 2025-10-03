import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const PreyasAquos: bakuganType = {
    key: 'preyas-aquos',
    name: 'Preyas',
    attribut: 'Aquos',
    image: 'preyas',
    powerLevel: 300,
    family: 'Preyas',
    exclusiveAbilities: ['ombre-bleue']
}

export const PreyasGateCard: gateCardType = {
    key: 'preyas-gate-card',
    name: 'Carte Personnage: Preyas',
    maxInDeck: 1,
    family: 'Preyas',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Preyas présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'preyas-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Preyas' })

    },
}

export const DiabloAquos: bakuganType = {
    key: 'diablo-aquos',
    name: 'Diablo',
    attribut: 'Aquos',
    image: 'diablo',
    powerLevel: 400,
    family: 'Diablo',
    exclusiveAbilities: []
}

export const DiabloGateCard: gateCardType = {
    key: 'diablo-gate-card',
    name: 'Carte Personnage: Diablo',
    maxInDeck: 1,
    family: 'Diablo',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Diablo présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'diablo-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Diablo' })

    },
}


export const AngeloAquos: bakuganType = {
    key: 'angelo-aquos',
    name: 'Angelo',
    attribut: 'Aquos',
    image: 'angelo',
    powerLevel: 400,
    family: 'Angelo',
    exclusiveAbilities: []
}

export const AngeloGateCard: gateCardType = {
    key: 'angelo-gate-card',
    name: 'Carte Personnage: Angelo',
    maxInDeck: 1,
    family: 'Angelo',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Angelo présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'angelo-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Angelo' })

    },
}