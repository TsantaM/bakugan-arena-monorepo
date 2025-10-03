import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const GarganoidPyrus: bakuganType = {
    key: 'garganoid-pyrus',
    name: 'Garganoid',
    image: 'garganoid',
    attribut: 'Pyrus',
    powerLevel: 330,
    family: 'Garganoid',
    exclusiveAbilities: ['cape de feu']
}

export const GaraganoidAquos: bakuganType = {
    key: 'garganoid-aquos',
    name: 'Garganoid',
    attribut: 'Aquos',
    exclusiveAbilities: [],
    family: 'Garganoid',
    image: 'garganoid',
    powerLevel: 330
}

export const GarganoidGateCard: gateCardType = {
    key: 'garganoid-gate-card',
    name: 'Carte Personnage: Garganoid',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Garganoid présent sur elle`,
    family: 'Garganoid',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'garganoid-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Garganoid' })

    },
}