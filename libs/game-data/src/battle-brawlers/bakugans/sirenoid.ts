import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"


export const SirenoidAquos: bakuganType = {
    key: 'sirenoid-aquos',
    name: 'Sirenoid',
    attribut: 'Aquos',
    image: 'sirenoid',
    family: 'sirenoid',
    powerLevel: 370,
    exclusiveAbilities: ['anti-muse', 'vent-cinglant'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SirenoidGateCard: gateCardType = {
    key: 'sirenoid-gate-card',
    name: 'Charachter: Sirenoid',
    maxInDeck: 1,
    family: 'sirenoid',
    description: `When this card is activated, it doubles the level of all Sirenoid on it.`,
    image: 'sirenoid.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'sirenoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'sirenoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'sirenoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'sirenoid' })
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