import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"

export const FalconeerPyrus: bakuganType = {
    key: 'falconeer-pyrus',
    name: 'Falconeer',
    attribut: 'Pyrus',
    powerLevel: 370,
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
    powerLevel: 370,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer',
    banList: [],
    canChangeAttribut: false
}

export const FalconeerGateCard: gateCardType = {
    key: 'falconeer-gate-card',
    maxInDeck: 1,
    image: 'falconeer.png',
    family: 'Falconeer',
    imageByAttribut: {
        Pyrus: CharacterCardByAttribut('falconeer', 'Pyrus'),
        Ventus: CharacterCardByAttribut('falconeer', 'Ventus')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Falconeer' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Falconeer' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== FalconeerPyrus.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== FalconeerPyrus.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })

    },
}