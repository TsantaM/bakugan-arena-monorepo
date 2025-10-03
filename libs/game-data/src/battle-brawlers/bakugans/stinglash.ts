import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const StinglashAquos: bakuganType = {
    key: 'stinglash-aquos',
    name: 'Stinglash',
    attribut: 'Aquos',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: ['maitre-des-profondeurs'],
    powerLevel: 300
}

export const StinglashDarkus: bakuganType = {
    key: 'stinglash-darkus',
    name: 'Stinglash',
    attribut: 'Darkus',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 300
}


export const StinglashSubterra: bakuganType = {
    key: 'stinglash-subterra',
    name: 'Stinglash',
    attribut: 'Subterra',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 300
}

export const StinglashGateCard: gateCardType = {
    key: 'stinglash-gate-card',
    name: 'Carte Personnage: Stinglash',
    maxInDeck: 1,
    family: 'Stinglash',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Stinglash présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'stinglash-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Stinglash' })

    },
}