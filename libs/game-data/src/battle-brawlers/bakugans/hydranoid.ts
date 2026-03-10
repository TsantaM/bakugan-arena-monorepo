import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const HydranoidDarkus: bakuganType = {
    key: 'hydranoid-darkus',
    name: 'Hydranoid',
    attribut: 'Darkus',
    image: 'hydranoid',
    powerLevel: 370,
    family: 'Hydranoid',
    exclusiveAbilities: ['chambre-de-gravité'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const DeltaHydranoidDarkus: bakuganType = {
    key: 'delta-hydranoid-darkus',
    name: 'Hydranoid Delta',
    attribut: 'Darkus',
    image: 'hydranoid-delta',
    powerLevel: 450,
    family: 'Hydranoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const AlphaHydranoidDarkus: bakuganType = {
    key: 'alpha-hydranoid-darkus',
    name: 'Hydranoid Alpha',
    attribut: 'Darkus',
    image: 'hydranoid-alpha',
    powerLevel: 500,
    family: 'Hydranoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HydranoidGateCard: gateCardType = {
    key: 'hydranoid-gate-card',
    name: 'Charachter: Hydranoid',
    maxInDeck: 1,
    family: 'Hydranoid',
    description: `When this card is activated, it doubles the level of all Hydranoid on it.`,
    image: 'hydranoid.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Hydranoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Hydranoid' })
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
        if (bakugan.family !== HydranoidDarkus.family) return

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
        if (bakugan.family !== HydranoidGateCard.family) return

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