import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const CycloidSubterra: bakuganType = {
    key: 'cycloid-subterra',
    name: 'Cycloid',
    family: 'Cycloid',
    image: 'cycloid',
    attribut: 'Subterra',
    powerLevel: 370,
    exclusiveAbilities: ['gauche-gigantesque', 'massue-gigantesque']
}

export const CycloidGateCard: gateCardType = {
    key: 'cycloid-gate-card',
    name: 'Carte Personnage: Cycloid',
    maxInDeck: 1,
    family: 'Cycloid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Cycloid présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'cycloid-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Cycloid' })

    },
}