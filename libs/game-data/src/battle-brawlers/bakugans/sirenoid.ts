import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const SirenoidAquos: bakuganType = {
    key: 'sirenoid-aquos',
    name: 'Sirenoid',
    attribut: 'Aquos',
    image: 'sirenoid',
    family: 'sirenoid',
    powerLevel: 370,
    exclusiveAbilities: ['anti-muse']
}

export const SirenoidGateCard: gateCardType = {
    key: 'sirenoid-gate-card',
    name: 'Carte Personnage: Sirenoid',
    maxInDeck: 1,
    family: 'Sirenoid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Sirenoid présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'sirenoid-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Sirenoid' })

    },
}