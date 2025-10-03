import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const LimulusAquos: bakuganType = {
    key: 'limulus-aquos',
    name: 'Limulus',
    image: 'limulus',
    powerLevel: 290,
    family: 'Limulus',
    exclusiveAbilities: ['divisio-holographique'],
    attribut: 'Aquos'
}

export const LimulusGateCard: gateCardType = {
    key: 'limulus-gate-card',
    name: 'Carte Personnage: Limulus',
    maxInDeck: 1,
    family: 'Limulus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Limulus présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Limulus' })

    },
}