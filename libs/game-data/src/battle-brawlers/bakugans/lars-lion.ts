import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { GateCardImages } from "../../store/gate-card-images.js";
import { LegendarySoldiersBanList } from "../../store/starter-banlist.js";
import type { bakuganType, gateCardType } from "../../type/type-index.js";

const family: string = "lars-lion"

export const LarsLionHaos: bakuganType = {
    key: "lars-lion",
    name: "Lars Lion",
    banList: LegendarySoldiersBanList,
    attribut: "Haos",
    canChangeAttribut: false,
    exclusiveAbilities: ['sagittarius-arrow'],
    family,
    image: "lars-lion",
    powerLevel: 500,
}

export const LarsLionGateCard: gateCardType = {
    key: "lars-lion-gate-card",
    image: 'caracter-gate-cards/lars-lion.jpeg',
    maxInDeck: 1,
    family,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'lars-lion-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'lars-lion-gate-card')
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
        PowerChange({
            roomState,
            bakugan,
            G: basePower,
            malus: false,
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })

    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
}