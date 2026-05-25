import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"


export const RobotallionPyrus: bakuganType = {
    key: 'robotallion-pyrus',
    name: 'Robotallion',
    image: 'robotallion',
    attribut: 'Pyrus',
    family: 'Robotallion',
    powerLevel: 350,
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
    powerLevel: 350,
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
    powerLevel: 350,
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
    powerLevel: 350,
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
    imageByAttribut: {
        Aquos: CharacterCardByAttribut('robotallion', 'Aquos'),
        Haos: CharacterCardByAttribut('robotallion', 'Haos'),
        Darkus: CharacterCardByAttribut('robotallion', 'Darkus'),
        Pyrus: CharacterCardByAttribut('robotallion', 'Pyrus'),
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Robotallion' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'robotallion-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Robotallion' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== RobotallionGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== RobotallionGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
}