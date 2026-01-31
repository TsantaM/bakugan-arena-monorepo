import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"

export const MantrisPyrus: bakuganType = {
    key: 'mantris-pyrus',
    name: 'Mantris',
    attribut: 'Pyrus',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisDarkus: bakuganType = {
    key: 'mantris-darkus',
    name: 'Mantris',
    attribut: 'Darkus',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisHaos: bakuganType = {
    key: 'mantris-haos',
    name: 'Mantris',
    attribut: 'Haos',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisSubterra: bakuganType = {
    key: 'mantris-subterra',
    name: 'Mantris',
    attribut: 'Subterra',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisGateCard: gateCardType = {
    key: 'mantris-gate-card',
    name: 'Charachter: Mantris',
    maxInDeck: 1,
    family: 'Mantris',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Mantris présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'mantris-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Mantris' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'mantris-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Mantris' })
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