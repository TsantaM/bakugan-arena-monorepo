import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const ReaperDarkus: bakuganType = {
    key: 'reaper-darkus',
    name: 'Reaper',
    attribut: 'Darkus',
    family: 'Reaper',
    powerLevel: 370,
    image: 'reaper',
    exclusiveAbilities: ['dimmension-quatre']
}

export const ReaperGateCard: gateCardType = {
    key: 'reaper-gate-card',
    name: 'Carte Personnage: Reaper',
    maxInDeck: 1,
    family: 'Reaper',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Reaper présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'reaper-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Reaper' })

    },
}