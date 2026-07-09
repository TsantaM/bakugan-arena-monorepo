import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { bakuganType, gateCardType } from "../../type/game-data-types.js";

const family = 'Laserman'

export const LasermanDarkus: bakuganType = {
    key: 'laserman-darkus',
    name: 'Laserman',
    attribut: 'Darkus',
    family: family,
    powerLevel: 400,
    canChangeAttribut: false,
    image: 'laserman',
    exclusiveAbilities: ['leap-sting'],
    banList: [],
}

export const LasermanGateCard: gateCardType = {
    key: 'laserman-gate-card',
    name: 'Charachter: Laserman',
    maxInDeck: 1,
    family: family,
    description: `When this gate card opens on its slot, this card adds Gs to every Laserman Bakugan on that slot equal to their current G-Power at that moment. Requires at least two Bakugan on that slot during battle. The bonus is reversed if this card is nullified.`,
    image: 'laserman.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'laserman-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'laserman-gate-card')
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