import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"

const powerLevel: number = 330
const family: string = 'Centipod'

export const CentipodDarkus: bakuganType = {
    key: 'centipod-darkus',
    name: 'Centipod',
    attribut: 'Darkus',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: ['regain-subit'],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodPyrus: bakuganType = {
    key: 'centipod-pyrus',
    name: 'Centipod',
    attribut: 'Pyrus',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodHaos: bakuganType = {
    key: 'centipod-haos',
    name: 'Centipod',
    attribut: 'Haos',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodSubterra: bakuganType = {
    key: 'centipod-subterra',
    name: 'Centipod',
    attribut: 'Subterra',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodGateCard: gateCardType = {
    key: 'centipod-gate-card',
    name: 'Carte Personnage: Centipod',
    maxInDeck: 1,
    family: 'Centipod',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Centipod présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'centipod-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'centipod-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: family })
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