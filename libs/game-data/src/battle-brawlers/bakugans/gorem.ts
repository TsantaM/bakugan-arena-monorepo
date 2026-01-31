import { bakuganType, CancelCaracterGateCard, CaracterGateCardEffect, gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const GoremSubterra: bakuganType = {
    key: 'gorem-subterra',
    name: 'Gorem',
    attribut: 'Subterra',
    image: 'gorem',
    powerLevel: 380,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HammerGoremSubterra: bakuganType = {
    key: 'hammer-gorem-subterra',
    name: 'Hammer Gorem',
    attribut: 'Subterra',
    image: 'gorem-hammer',
    powerLevel: 450,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const GoremGateCard: gateCardType = {
    key: 'gorem-gate-card',
    name: 'Charachter: Gorem',
    maxInDeck: 1,
    family: 'Gorem',
    description: `When this card is activated, it doubles the level of all Gorem on it.`,
    image: 'gorem.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Gorem' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Gorem' })
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