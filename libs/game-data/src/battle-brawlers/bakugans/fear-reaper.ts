import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/index.js'

export const FearReaperPyrus: bakuganType = {
    key: 'fear-reaper-pyrus',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Pyrus',
    family: 'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperHaos: bakuganType = {
    key: 'fear-reaper-haos',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Haos',
    family: 'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperDarkus: bakuganType = {
    key: 'fear-reaper-darkus',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Darkus',
    family: 'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperAquos: bakuganType = {
    key: 'fear-reaper-aquos',
    name: 'Fear Reaper',
    image: 'fear-reaper',
    attribut: 'Aquos',
    family: 'Fear Reaper',
    powerLevel: 330,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperGateCard: gateCardType = {
    key: 'fear-reaper-gate-card',
    name: 'Charachter: Fear Reaper',
    maxInDeck: 1,
    description: `When this card is activated, it doubles the level of all Fear Reaper on it.`,
    family: 'Fear Reaper',
    image: 'fear-reaper.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fear-reaper-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Fear Reaper' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fear-reaper-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Fear Reaper' })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}