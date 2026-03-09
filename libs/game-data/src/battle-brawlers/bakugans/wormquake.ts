import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"


export const WormquakeSubterra: bakuganType = {
    key: 'wormquake-subterra',
    name: 'Wormquake',
    attribut: 'Subterra',
    exclusiveAbilities: ['trappe-de-sable'],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const WormquakeDarkus: bakuganType = {
    key: 'wormquake-darkus',
    name: 'Wormquake',
    attribut: 'Darkus',
    exclusiveAbilities: [],
    family: 'Wormquake',
    image: 'wormquake',
    powerLevel: 300,
    banList: [],
    canChangeAttribut: false
}

export const WormquakeGateCard: gateCardType = {
    key: 'wormquake-gate-card',
    name: 'Charachter: Wormquake',
    maxInDeck: 1,
    family: 'Wormquake',
    description: `When this card is activated, it doubles the level of all Wormquake on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'wormquake-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Wormquake' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'wormquake-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Wormquake' })
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
        if (bakugan.family !== WormquakeGateCard.family) return

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
        if (bakugan.family !== WormquakeGateCard.family) return

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