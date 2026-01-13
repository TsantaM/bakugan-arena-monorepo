import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"
import { StarterBanList } from "../../store/starter-banlist"

export const TentaclearHaos: bakuganType = {
    key: 'tentaclear-haos',
    name: 'Tentaclear',
    attribut: 'Haos',
    powerLevel: 370,
    family: 'Tentaclear',
    image: 'tentaclear',
    exclusiveAbilities: ['rayon-gamma'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const TentaclearGateCard: gateCardType = {
    key: 'tentaclear-gate-card',
    name: 'Charachter: Tentaclear',
    maxInDeck: 1,
    family: 'Tentaclear',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Tentaclear présent sur elle`,
    image: 'tentaclear.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tentaclear-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Tentaclear' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tentaclear-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tentaclear' })
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