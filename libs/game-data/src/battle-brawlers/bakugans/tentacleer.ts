import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const TentaclearHaos: bakuganType = {
    key: 'tentaclear-haos',
    name: 'Tentaclear',
    attribut: 'Haos',
    powerLevel: 370,
    family: 'Tentaclear',
    image: 'tentaclear',
    exclusiveAbilities: ['rayon-gamma']
}

export const TentaclearGateCard: gateCardType = {
    key: 'tentaclear-gate-card',
    name: 'Carte Personnage: Tentaclear',
    maxInDeck: 1,
    family: 'Tentaclear',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Tentaclear présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tentaclear-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Tentaclear' })

    },
}