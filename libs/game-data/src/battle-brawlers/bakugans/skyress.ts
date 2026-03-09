import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/starter-banlist.js"
import { FurryOfWind, VentViolentDeNobelesseVerte } from "../exclusive-abilities/exclusive-abilities.js"

export const SkyressVentus: bakuganType = {
    name: 'Skyress',
    attribut: 'Ventus',
    image: 'skyress',
    key: 'skyress-ventus',
    powerLevel: 370,
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
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const SkyressGateCard: gateCardType = {
    key: 'skyress-gate-card',
    name: 'Charachter: Skyress',
    maxInDeck: 1,
    family: 'Skyress',
    description: `When this card is activated, it doubles the level of all Skyress on it.`,
    image: 'skyress.PNG',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Skyress' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'skyress-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Skyress' })
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
        if (bakugan.family !== SkyressGateCard.family) return

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
        if (bakugan.family !== SkyressGateCard.family) return

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