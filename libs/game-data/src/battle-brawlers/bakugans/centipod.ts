import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { GateCardImages } from "../../store/store-index.js"

const powerLevel: number = 330
const family: string = 'Centipod'

export const CentipodDarkus: bakuganType = {
    key: 'centipod-darkus',
    name: 'Centipod',
    attribut: 'Darkus',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: ['regain-subit', `force-d'attraction`],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodPyrus: bakuganType = {
    key: 'centipod-pyrus',
    name: 'Centipod',
    attribut: 'Pyrus',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [`force-d'attraction`],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodHaos: bakuganType = {
    key: 'centipod-haos',
    name: 'Centipod',
    attribut: 'Haos',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [`force-d'attraction`],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodSubterra: bakuganType = {
    key: 'centipod-subterra',
    name: 'Centipod',
    attribut: 'Subterra',
    image: 'centipod',
    family: 'Centipod',
    exclusiveAbilities: [`force-d'attraction`],
    powerLevel: powerLevel,
    banList: [],
    canChangeAttribut: false
}

export const CentipodGateCard: gateCardType = {
    key: 'centipod-gate-card',
    name: 'Charachter: Centipod',
    maxInDeck: 1,
    family: 'Centipod',
    description: `When this card is activated, it doubles the level of all Centipods on it.`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'centipod-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'centipod-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: family })
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
        if (canceled) return
        if (!open) return
        if (bakugan.family !== CentipodDarkus.family) return

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
        if (bakugan.family !== CentipodDarkus.family) return

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