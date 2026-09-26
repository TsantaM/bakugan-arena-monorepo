import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages, StarterBanList } from "../../store/store-index.js"

const family: string = "warius"

export const WariusPyrus: bakuganType = {
    key: 'warius-pyrus',
    name: 'Warius',
    attribut: "Pyrus",
    banList: [],
    canChangeAttribut: false,
    exclusiveAbilities: ['brise-muraille'],
    family: family,
    image: "warius",
    powerLevel: 430
}

export const WariusDarkus: bakuganType = {
    key: 'warius-darkus',
    name: 'Warius',
    attribut: "Darkus",
    banList: [],
    canChangeAttribut: false,
    exclusiveAbilities: ['verdict-du-bourreau'],
    family: family,
    image: "warius",
    powerLevel: 430
}

export const WariusAquos: bakuganType = {
    key: 'warius-aquos',
    name: 'Warius',
    attribut: "Aquos",
    banList: [],
    canChangeAttribut: false,
    exclusiveAbilities: ['ancre-abyssale'],
    family: family,
    image: "warius",
    powerLevel: 430
}

export const WariusGateCard: gateCardType = {
    key: 'warius-gate-card',
    image: GateCardImages.caracter,
    maxInDeck: 1,
    family,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'warius-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'warius-gate-card')
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
