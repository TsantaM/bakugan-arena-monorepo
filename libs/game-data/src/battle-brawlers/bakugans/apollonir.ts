import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { GateCardImages } from "../../store/gate-card-images.js";
import { LegendarySoldiersBanList } from "../../store/starter-banlist.js";
import { bakuganType, gateCardType } from "../../type/type-index.js";
const family: string = "apollonir"

export const ApollonirPyrus: bakuganType = {
    key: "apollonir-pyrus",
    attribut: "Pyrus",
    banList: LegendarySoldiersBanList,
    canChangeAttribut: false,
    exclusiveAbilities: [],
    family: family,
    image: "apollonir",
    name: "Apollonir",
    powerLevel: 500,
}

export const ApollonirPyrusGateCard: gateCardType = {
    key: 'apollonir-gate-card',
    image: GateCardImages.command,
    maxInDeck: 1,
    family,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'apollonir-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'apollonir-gate-card')
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
