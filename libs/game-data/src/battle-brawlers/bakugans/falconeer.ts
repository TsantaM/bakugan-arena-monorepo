import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from '../../function/index.js'

export const FalconeerPyrus: bakuganType = {
    key: 'falconeer-pyrus',
    name: 'Falconeer',
    attribut: 'Pyrus',
    powerLevel: 320,
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
    powerLevel: 320,
    exclusiveAbilities: [],
    family: 'Falconeer',
    image: 'falconeer',
    banList: [],
    canChangeAttribut: false
}

export const FalconeerGateCard: gateCardType = {
    key: 'falconeer-gate-card',
    name: 'Charachter: Falconeer',
    maxInDeck: 1,
    image: 'falconeer.png',
    description: `When this card is activated, it doubles the level of all Falconeer on it.`,
    family: 'Falconeer',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Falconeer' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'falconeer-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Falconeer' })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
            turn: roomState.turnState.turnCount
        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
            turn: roomState.turnState.turnCount
        })

    },
}