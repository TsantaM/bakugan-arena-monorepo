import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const WormquakeSubterra: bakuganType = {
    key: 'wormquake-subterra',
    name: 'Wormquake',
    attribut: 'Subterra',
    exclusiveAbilities: ['trappe-de-sable'],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300
}

export const WormquakeDarkus: bakuganType = {
    key: 'wormquake-darkus',
    name: 'Wormquake',
    attribut: 'Darkus',
    exclusiveAbilities: [],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300
}

export const WormquakeGateCard: gateCardType = {
    key: 'wormquake-gate-card',
    name: 'Carte Personnage: Wormquake',
    maxInDeck: 1,
    family: 'Wormquake',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Wormquake présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'wormquake-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Wormquake' })

    },
}