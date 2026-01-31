import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages, StarterBanList } from "../../store/store-index.js"


export const PreyasAquos: bakuganType = {
    key: 'preyas-aquos',
    name: 'Preyas',
    attribut: 'Aquos',
    image: 'preyas',
    powerLevel: 300,
    family: 'Preyas',
    exclusiveAbilities: ['ombre-bleue'],
    banList: StarterBanList,
    canChangeAttribut: true
}

export const PreyasGateCard: gateCardType = {
    key: 'preyas-gate-card',
    name: 'Charachter: Preyas',
    maxInDeck: 1,
    family: 'Preyas',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Preyas présent sur elle`,
    image: 'preyas.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'preyas-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Preyas' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'preyas-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Preyas' })
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

export const DiabloAquos: bakuganType = {
    key: 'diablo-aquos',
    name: 'Diablo',
    attribut: 'Aquos',
    image: 'diablo',
    powerLevel: 400,
    family: 'Diablo',
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false,
    seconaryAttribut: 'Pyrus'
}

export const DiabloGateCard: gateCardType = {
    key: 'diablo-gate-card',
    name: 'Charachter: Diablo',
    maxInDeck: 1,
    family: 'Diablo',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Diablo présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'diablo-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Diablo' })
        return null


    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'diablo-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Diablo' })
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


export const AngeloAquos: bakuganType = {
    key: 'angelo-aquos',
    name: 'Angelo',
    attribut: 'Aquos',
    image: 'angelo',
    powerLevel: 400,
    family: 'Angelo',
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false,
    seconaryAttribut: 'Haos'
}

export const AngeloGateCard: gateCardType = {
    key: 'angelo-gate-card',
    name: 'Charachter: Angelo',
    maxInDeck: 1,
    family: 'Angelo',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Angelo présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'angelo-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Angelo' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'angelo-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Angelo' })
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