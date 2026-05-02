import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from "../../function";
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut";
import { bakuganType, gateCardType } from "../../type/type-index.js";

const family = 'Bee Striker'

export const BeeStrikerVentus: bakuganType = {
    key: 'bee-striker-ventus',
    name: 'Bee Striker',
    attribut: 'Ventus',
    banList: [],
    exclusiveAbilities: ['spit-pointer'],
    canChangeAttribut: false,
    image: 'bee-striker',
    family: family,
    powerLevel: 350,
}

export const BeeStrikerGateCard: gateCardType = {
    key: 'bee-striker-gate-card',
    name: 'Charachter: Bee Striker',
    maxInDeck: 1,
    family: family,
    description: `When this card is activated, it doubles the level of all Bee Striker on it.`,
    image: 'caracter-gate-cards/bee-striker-ventus.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'bee-striker-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'bee-striker-gate-card')
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
            turn: roomState.turnState.turnCount
        })
        
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}