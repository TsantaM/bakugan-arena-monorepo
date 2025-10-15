import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"

export const SiegePyrus: bakuganType = {
    key: 'siege-pyrus',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Pyrus',
    image: 'siege',
    exclusiveAbilities: ['lance-de-feu'],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeAquos: bakuganType = {
    key: 'siege-aquos',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Aquos',
    image: 'siege',
    exclusiveAbilities: ['javelot-aquos', 'tsunami'],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeHaos: bakuganType = {
    key: 'siege-haos',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Haos',
    image: 'siege',
    exclusiveAbilities: [],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeDarkus: bakuganType = {
    key: 'siege-darkus',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Darkus',
    image: 'siege',
    exclusiveAbilities: [],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeGateCard: gateCardType = {
    key: 'siege-gate-card',
    name: 'Carte Personnage: Siege',
    maxInDeck: 1,
    family: 'Siege',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Siege présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'siege-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Siege' })
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'siege-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Siege' })
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