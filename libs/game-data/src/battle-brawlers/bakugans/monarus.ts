import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"


export const MonarusVentus: bakuganType = {
    key: 'monarus-ventus',
    name: 'Monarus',
    image: 'monarus',
    attribut: 'Ventus',
    family: 'Monarus',
    powerLevel: 320,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const MonarusGateCard: gateCardType = {
    key: 'monarus-gate-card',
    name: 'Charachter: Monarus',
    maxInDeck: 1,
    family: 'Monarus',
    description: `When this card is activated, it doubles the level of all Monarus on it.`,
    image: 'monarus.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Monarus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'monarus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Monarus' })
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
        if (bakugan.family !== MonarusGateCard.family) return

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
        if (bakugan.family !== MonarusGateCard.family) return

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