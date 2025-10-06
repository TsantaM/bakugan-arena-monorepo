import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const FalconeerPyrus: bakuganType = {
    key: 'falconeer-pyrus',
    name: 'Falconeer',
    attribut: 'Pyrus',
    powerLevel: 290,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer'
}

export const FalconeerVentus: bakuganType = {
    key: 'falconeer-ventus',
    name: 'Falconeer',
    attribut: 'Ventus',
    powerLevel: 290,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer'
}

export const FalconeerGateCard: gateCardType = {
    key: 'falconeer-gate-card',
    name: 'Carte Personnage: Falconeer',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Falconneer présent sur elle`,
    family: 'Falconeer',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Falconeer' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Falconeer' })
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