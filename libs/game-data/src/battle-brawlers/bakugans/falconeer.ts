import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/index.js'

export const FalconeerPyrus: bakuganType = {
    key: 'falconeer-pyrus',
    name: 'Falconeer',
    attribut: 'Pyrus',
    powerLevel: 290,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer',
    banList: [],
    canChangeAttribut: false
}

export const FalconeerVentus: bakuganType = {
    key: 'falconeer-ventus',
    name: 'Falconeer',
    attribut: 'Ventus',
    powerLevel: 290,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer',
    banList: [],
    canChangeAttribut: false
}

export const FalconeerGateCard: gateCardType = {
    key: 'falconeer-gate-card',
    name: 'Charachter: Falconeer',
    maxInDeck: 1,
    image: 'falconeer.png',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Falconneer présent sur elle`,
    family: 'Falconeer',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Falconeer' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Falconeer' })
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