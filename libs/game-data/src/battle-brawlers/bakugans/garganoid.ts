import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"

export const GarganoidPyrus: bakuganType = {
    key: 'garganoid-pyrus',
    name: 'Garganoid',
    image: 'garganoid',
    attribut: 'Pyrus',
    powerLevel: 330,
    family: 'Garganoid',
    exclusiveAbilities: ['cape de feu'],
    banList: [],
    canChangeAttribut: false
}

export const GaraganoidAquos: bakuganType = {
    key: 'garganoid-aquos',
    name: 'Garganoid',
    attribut: 'Aquos',
    exclusiveAbilities: [],
    family: 'Garganoid',
    image: 'garganoid',
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const GarganoidGateCard: gateCardType = {
    key: 'garganoid-gate-card',
    name: 'Charachter: Garganoid',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Garganoid présent sur elle`,
    image: GateCardImages.caracter,
    family: 'Garganoid',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'garganoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Garganoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'garganoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Garganoid' })
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