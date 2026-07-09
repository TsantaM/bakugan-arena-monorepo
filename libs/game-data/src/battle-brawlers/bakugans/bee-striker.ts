import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { bakuganType, gateCardType } from "../../type/type-index.js";

const family = 'Bee Striker'

export const BeeStrikerVentus: bakuganType = {
    key: 'bee-striker-ventus',
    name: 'Bee Striker',
    attribut: 'Ventus',
    banList: [],
    exclusiveAbilities: ['spit-pointer'],
    canChangeAttribut: false,
    image: 'bee-striker',
    family: family,
    powerLevel: 400,
}

export const BeeStrikerGateCard: gateCardType = {
    key: 'bee-striker-gate-card',
    name: 'Charachter: Bee Striker',
    maxInDeck: 1,
    family: family,
    description: `When this gate card opens on its slot, this card adds Gs to every Bee Striker Bakugan on that slot equal to their current G-Power at that moment. Requires at least two Bakugan on that slot during battle. The bonus is reversed if this card is nullified.`,
    image: 'caracter-gate-cards/bee-striker-ventus.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'bee-striker-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'bee-striker-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: family })
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== family) return

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
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== family) return

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
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
}