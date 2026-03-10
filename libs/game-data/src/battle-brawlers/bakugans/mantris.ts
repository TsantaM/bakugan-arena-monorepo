import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"

export const MantrisPyrus: bakuganType = {
    key: 'mantris-pyrus',
    name: 'Mantris',
    attribut: 'Pyrus',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisDarkus: bakuganType = {
    key: 'mantris-darkus',
    name: 'Mantris',
    attribut: 'Darkus',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisHaos: bakuganType = {
    key: 'mantris-haos',
    name: 'Mantris',
    attribut: 'Haos',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisSubterra: bakuganType = {
    key: 'mantris-subterra',
    name: 'Mantris',
    attribut: 'Subterra',
    image: 'mantris',
    powerLevel: 320,
    family: 'Mantris',
    exclusiveAbilities: ['marionnette', 'lance-eclair', 'machettes-jumelles'],
    banList: [],
    canChangeAttribut: false
}

export const MantrisGateCard: gateCardType = {
    key: 'mantris-gate-card',
    name: 'Charachter: Mantris',
    maxInDeck: 1,
    family: 'Mantris',
    description: `When this card is activated, it doubles the level of all Mantris on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'mantris-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Mantris' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'mantris-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Mantris' })
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
        if (bakugan.family !== MantrisGateCard.family) return

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
        if (bakugan.family !== MantrisGateCard.family) return

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