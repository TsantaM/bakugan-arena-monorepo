import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { GateCardImages } from "../../store/gate-card-images.js"
import { type bakuganType, type gateCardType } from "../../type/game-data-types.js"

export const LimulusAquos: bakuganType = {
    key: 'limulus-aquos',
    name: 'Limulus',
    image: 'limulus',
    powerLevel: 290,
    family: 'Limulus',
    exclusiveAbilities: ['divisio-holographique'],
    attribut: 'Aquos',
    banList: [],
    canChangeAttribut: false
}

export const LimulusGateCard: gateCardType = {
    key: 'limulus-gate-card',
    name: 'Charachter: Limulus',
    maxInDeck: 1,
    family: 'Limulus',
    description: `When this card is activated, it doubles the level of all Limulus on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Limulus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Limulus' })
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
        if (bakugan.family !== LimulusGateCard.family) return

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
        if (bakugan.family !== LimulusAquos.family) return

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