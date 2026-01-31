import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"


export const SaurusPyrus: bakuganType = {
    key: 'saurus-pyrus',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Pyrus',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const SaurusSubterra: bakuganType = {
    key: 'saurus-subterra',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Subterra',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const SaurusHaos: bakuganType = {
    key: 'saurus-haos',
    name: 'Saurus',
    image: 'saurus',
    attribut: 'Haos',
    family: 'Saurus',
    powerLevel: 290,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const SaurusGateCard: gateCardType = {
    key: 'saurus-gate-card',
    name: 'Charachter: Saurus',
    maxInDeck: 1,
    family: 'Saurus',
    description: `When this card is activated, it doubles the level of all Saurus on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'saurus-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Saurus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'saurus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Saurus' })
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