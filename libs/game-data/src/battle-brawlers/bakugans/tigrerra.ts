import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const TigrerraHaos: bakuganType = {
    key: 'tigrerra-haos',
    name: 'Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra',
    powerLevel: 340,
    family: 'Tigrerra',
    exclusiveAbilities: ['sabre-de-la-mort'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const BladeTigrerraHaos: bakuganType = {
    key: 'blade-tigrerra-haos',
    name: 'Blade Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra-blade',
    powerLevel: 450,
    family: 'Tigrerra',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const TigrerraGateCard: gateCardType = {
    key: 'tigrerra-gate-card',
    name: 'Charachter: Tigrerra',
    maxInDeck: 1,
    family: 'Tigrerra',
    description: `When this card is activated, it doubles the level of all Tigrerra on it.`,
    image: 'tigrerra.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Tigrerra' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tigrerra' })
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