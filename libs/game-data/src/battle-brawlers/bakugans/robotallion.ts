import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"


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
    name: 'Charachter: Robotallion',
    maxInDeck: 1,
    family: 'Robotallion',
    description: `When this card is activated, it doubles the level of all Robotallion on it.`,
    image: 'robotallion.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Robotallion' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Robotallion' })
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