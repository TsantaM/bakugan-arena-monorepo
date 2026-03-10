import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages, StarterBanList } from "../../store/store-index.js"

export const FourtressPyrus: bakuganType = {
    key: 'fourtress-pyrus',
    name: 'Fortress',
    attribut: 'Pyrus',
    image: 'fourtress',
    family: 'Fortress',
    powerLevel: 370,
    exclusiveAbilities: ['visage-de-la-fureur', 'visage-du-chagrin', 'visage-de-joie'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const FortressGateCard: gateCardType = {
    key: 'fortress-gate-card',
    name: 'Charachter: Fortress',
    maxInDeck: 1,
    description: `When this card is activated, it doubles the level of all Fortress on it.`,
    image: GateCardImages.caracter,
    family: 'Fortress',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fortress-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Fortress' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fortress-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Fortress' })
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
        if (bakugan.family !== FortressGateCard.family) return

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
        if (bakugan.family !== FortressGateCard.family) return

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