import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/index.js'
import { GateCardImages } from "../../store/store-index.js"

export const ElCondorHaos: bakuganType = {
    key: 'el-condor-haos',
    name: 'El Condor',
    attribut: 'Haos',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorVentus: bakuganType = {
    key: 'el-condor-ventus',
    name: 'El Condor',
    attribut: 'Ventus',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire', 'souffle-infini'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorSubterra: bakuganType = {
    key: 'el-condor-subterra',
    name: 'El Condor',
    attribut: 'Subterra',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorGateCard: gateCardType = {
    key: 'el-condor-gate-card',
    name: 'Charachter: El Condor',
    maxInDeck: 1,
    image: GateCardImages.caracter,
    description: `When this card is activated, it doubles the level of all El Condor on it.`,
    family: 'El Condor',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'el-condor-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'El Condor' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'el-condor-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'El Condor' })
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