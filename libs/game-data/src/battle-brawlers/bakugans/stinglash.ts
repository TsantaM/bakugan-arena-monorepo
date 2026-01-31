import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"


export const StinglashAquos: bakuganType = {
    key: 'stinglash-aquos',
    name: 'Stinglash',
    attribut: 'Aquos',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: ['maitre-des-profondeurs'],
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const StinglashDarkus: bakuganType = {
    key: 'stinglash-darkus',
    name: 'Stinglash',
    attribut: 'Darkus',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}


export const StinglashSubterra: bakuganType = {
    key: 'stinglash-subterra',
    name: 'Stinglash',
    attribut: 'Subterra',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const StinglashGateCard: gateCardType = {
    key: 'stinglash-gate-card',
    name: 'Charachter: Stinglash',
    maxInDeck: 1,
    family: 'Stinglash',
    description: `When this card is activated, it doubles the level of all Stinglash on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'stinglash-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Stinglash' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'stinglash-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Stinglash' })
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