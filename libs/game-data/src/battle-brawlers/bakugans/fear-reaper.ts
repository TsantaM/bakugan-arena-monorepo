import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const FearReaperPyrus: bakuganType = {
    key: 'fear-reaper-pyrus',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Pyrus',
    family:'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: []
}

export const FearReaperHaos: bakuganType = {
    key: 'fear-reaper-haos',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Haos',
    family:'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: []
}

export const FearReaperDarkus: bakuganType = {
    key: 'fear-reaper-darkus',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Darkus',
    family:'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: []
}

export const FearReaperAquos: bakuganType = {
    key: 'fear-reaper-aquos',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Aquos',
    family:'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: []
}

export const FearReaperGateCard: gateCardType = {
    key: 'fear-reaper-gate-card',
    name: 'Carte Personnage: Fear Reaper',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Fear Reaper présent sur elle`,
    family: 'Fear Reaper',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fear-reaper-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Fear Reaper' })

    },
}