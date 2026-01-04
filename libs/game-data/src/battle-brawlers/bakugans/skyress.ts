import type { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"

export const SkyressVentus: bakuganType = {
    name: 'Skyress',
    attribut: 'Ventus',
    image: 'skyress',
    key: 'skyress-ventus',
    powerLevel: 370,
    family: 'Skyress',
    exclusiveAbilities: ['vent-violent-de-noblesse-verte'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SkyressStormVentus: bakuganType = {
    name: 'Skyress Storm',
    attribut: 'Ventus',
    image: 'skyress-storm',
    key: 'skyress-storm-ventus',
    powerLevel: 450,
    family: 'Skyress',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SkyressGateCard: gateCardType = {
    key: 'skyress-gate-card',
    name: 'Carte Personnage: Skyress',
    maxInDeck: 1,
    family: 'Skyress',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Skyress présent sur elle`,
    image: 'skyress.PNG',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Skyress' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Skyress' })
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