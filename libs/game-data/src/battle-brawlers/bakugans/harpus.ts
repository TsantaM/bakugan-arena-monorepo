import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages, StarterBanList } from "../../store/store-index.js"

export const HarpusVentus: bakuganType = {
    key: 'harpus-ventus',
    name: 'Harpus',
    attribut: 'Ventus',
    image: 'harpus',
    family: 'Harpus',
    powerLevel: 370,
    exclusiveAbilities: ['tempête-de-plume'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HarpusGateCard: gateCardType = {
    key: 'harpus-gate-card',
    name: 'Charachter: Gorem',
    maxInDeck: 1,
    family: 'Harpus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Harpus présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Harpus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Harpus' })
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