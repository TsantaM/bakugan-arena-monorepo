import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/starter-banlist.js"
import { FurryOfWind } from "../exclusive-abilities/furry-of-wind.js"
import { VentViolentDeNobelesseVerte } from "../exclusive-abilities/vent-violent.js"

export const SkyressVentus: bakuganType = {
    name: 'Skyress',
    attribut: 'Ventus',
    image: 'skyress',
    key: 'skyress-ventus',
    powerLevel: 420,
    family: 'Skyress',
    exclusiveAbilities: [VentViolentDeNobelesseVerte.key, FurryOfWind.key],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SkyressStormVentus: bakuganType = {
    name: 'Skyress Storm',
    attribut: 'Ventus',
    image: 'skyress-storm',
    key: 'skyress-storm-ventus',
    powerLevel: 450,
    family: 'Skyress',
    exclusiveAbilities: ["gust-of-wind-blow-destruction-meteor-storm"],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SkyressGateCard: gateCardType = {
    key: 'skyress-gate-card',
    maxInDeck: 1,
    family: 'Skyress',
    image: 'caracter-gate-cards/skyress-ventus.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Skyress' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Skyress' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== SkyressGateCard.family) return

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
        if (bakugan.family !== SkyressGateCard.family) return

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