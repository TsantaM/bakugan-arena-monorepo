import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"


export const MonarusVentus: bakuganType = {
    key: 'monarus-ventus',
    name: 'Monarus',
    image: 'monarus',
    attribut: 'Ventus',
    family: 'Monarus',
    powerLevel: 290,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const MonarusGateCard: gateCardType = {
    key: 'monarus-gate-card',
    name: 'Charachter: Monarus',
    maxInDeck: 1,
    family: 'Monarus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Monarus présent sur elle`,
    image: 'monarus.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Monarus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Monarus' })
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