import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const HydranoidDarkus: bakuganType = {
    key: 'hydranoid-darkus',
    name: 'Hydranoid',
    attribut: 'Darkus',
    image: 'hydranoid',
    powerLevel: 340,
    family: 'Hydranoid',
    exclusiveAbilities: ['chambre-de-gravité']
}

export const DeltaHydranoidDarkus: bakuganType = {
    key: 'delta-hydranoid-darkus',
    name: 'Hydranoid Delta',
    attribut: 'Darkus',
    image: 'hydranoid-delta',
    powerLevel: 450,
    family: 'Hydranoid',
    exclusiveAbilities: []
}

export const AlphaHydranoidDarkus: bakuganType = {
    key: 'alpha-hydranoid-darkus',
    name: 'Hydranoid Alpha',
    attribut: 'Darkus',
    image: 'hydranoid-alpha',
    powerLevel: 500,
    family: 'Hydranoid',
    exclusiveAbilities: []
}

export const HydranoidGateCard: gateCardType = {
    key: 'hydranoid-gate-card',
    name: 'Carte Personnage: Hydranoid',
    maxInDeck: 1,
    family: 'Hydranoid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Hydranoid présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Hydranoid' })

    },
}