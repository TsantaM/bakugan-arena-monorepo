import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"

export const RobotallionPyrus: bakuganType = {
    key: 'robotallion-pyrus',
    name: 'Robotallion',
    image: 'robotallion',
    attribut: 'Pyrus',
    family: 'Robotallion',
    powerLevel: 310,
    exclusiveAbilities: ['robotalion-execution'],
    banList: [],
    canChangeAttribut: false
}

export const RobotallionAquos: bakuganType = {
    key: 'robotallion-aquos',
    name: 'Robotallion',
    image: 'robotallion',
    attribut: 'Aquos',
    family: 'Robotallion',
    powerLevel: 310,
    exclusiveAbilities: ['robotalion-execution'],
    banList: [],
    canChangeAttribut: false
}

export const RobotallionDarkus: bakuganType = {
    key: 'robotallion-darkus',
    name: 'Robotallion',
    image: 'robotallion',
    attribut: 'Darkus',
    family: 'Robotallion',
    powerLevel: 310,
    exclusiveAbilities: ['robotalion-execution'],
    banList: [],
    canChangeAttribut: false
}

export const RobotallionHaos: bakuganType = {
    key: 'robotallion-haos',
    name: 'Robotallion',
    image: 'robotallion',
    attribut: 'Haos',
    family: 'Robotallion',
    powerLevel: 310,
    exclusiveAbilities: ['robotalion-execution'],
    banList: [],
    canChangeAttribut: false
}

export const RobotallionGateCard: gateCardType = {
    key: 'robotallion-gate-card',
    name: 'Carte Personnage: Robotallion',
    maxInDeck: 1,
    family: 'Robotallion',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Robotallion présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Robotallion' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Robotallion' })
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