import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const FourtressPyrus: bakuganType = {
    key: 'fourtress-pyrus',
    name: 'Fortress',
    attribut: 'Pyrus',
    image: 'fourtress',
    family: 'Fortress',
    powerLevel: 370,
    exclusiveAbilities: ['visage-de-la-fureur', 'visage-du-chagrin', 'visage-de-joie']
}

export const FortressGateCard: gateCardType = {
    key: 'fortress-gate-card',
    name: 'Carte Personnage: Fortress',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Fortress présent sur elle`,
    family: 'Fortress',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        console.log('gateCardFortress')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Fortress' })

    },
}