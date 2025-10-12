import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const MonarusVentus: bakuganType = {
    key: 'monarus-ventus',
    name: 'Monarus',
    image: 'monarus',
    attribut: 'Ventus',
    family: 'Monarus',
    powerLevel: 290,
    exclusiveAbilities: []
}

export const MonarusGateCard: gateCardType = {
    key: 'monarus-gate-card',
    name: 'Carte Personnage: Monarus',
    maxInDeck: 1,
    family: 'Monarus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Monarus présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Monarus' })
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Monarus' })
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