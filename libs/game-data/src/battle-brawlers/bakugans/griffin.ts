import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const GriffinPyrus: bakuganType = {
    key: 'griffin-pyrus',
    name: 'Griffin',
    attribut: 'Pyrus',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: ['aile-enflammee']
}

export const GriffinHaos: bakuganType = {
    key: 'griffin-haos',
    name: 'Griffin',
    attribut: 'Haos',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: []
}

export const GriffinAquos: bakuganType = {
    key: 'griffin-aquos',
    name: 'Griffin',
    attribut: 'Aquos',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: []
}

export const GriffinGateCard: gateCardType = {
    key: 'griffin-gate-card',
    name: 'Carte Personnage: Griffin',
    maxInDeck: 1,
    family: 'griffin',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Griffin présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'griffin-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'griffin' })

    },
}