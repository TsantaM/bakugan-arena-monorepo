import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { GateCardImages } from "../../store/store-index.js"
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"

const powerLevel: number = 380
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
    imageByAttribut: {
        Darkus: CharacterCardByAttribut('centipod', 'Darkus'),
        Subterra: CharacterCardByAttribut('centipod', 'Subterra'),
        Pyrus: CharacterCardByAttribut('centipod', 'Pyrus'),
        Haos: CharacterCardByAttribut('centipod', 'Haos')
    },
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
        const { canceled, open } = slot.state
        
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
        const { canceled, open } = slot.state
        
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
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
}