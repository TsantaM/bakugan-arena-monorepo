import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const HarpusVentus: bakuganType = {
    key: 'harpus-ventus',
    name: 'Harpus',
    attribut: 'Ventus',
    image: 'harpus',
    family: 'Harpus',
    powerLevel: 370,
    exclusiveAbilities: ['tempête-de-plume']
}

export const HarpusGateCard: gateCardType = {
    key: 'harpus-gate-card',
    name: 'Carte Personnage: Gorem',
    maxInDeck: 1,
    family: 'Harpus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Harpus présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Harpus' })

    },
}