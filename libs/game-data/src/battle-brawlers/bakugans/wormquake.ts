import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"


export const WormquakeSubterra: bakuganType = {
    key: 'wormquake-subterra',
    name: 'Wormquake',
    attribut: 'Subterra',
    exclusiveAbilities: ['trappe-de-sable'],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const WormquakeDarkus: bakuganType = {
    key: 'wormquake-darkus',
    name: 'Wormquake',
    attribut: 'Darkus',
    exclusiveAbilities: [],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const WormquakeGateCard: gateCardType = {
    key: 'wormquake-gate-card',
    name: 'Charachter: Wormquake',
    maxInDeck: 1,
    family: 'Wormquake',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Wormquake présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'wormquake-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Wormquake' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'wormquake-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Wormquake' })
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