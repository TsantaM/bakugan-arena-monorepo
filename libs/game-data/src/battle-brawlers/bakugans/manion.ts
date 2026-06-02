import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { bakuganType, gateCardType } from "../../type/game-data-types.js";

const family = 'Manion'

export const ManionSubterra: bakuganType = {
    key: 'manion-subterra',
    name: 'Manion',
    family: family,
    attribut: 'Subterra',
    banList: [],
    canChangeAttribut: false,
    image: 'manion',
    powerLevel: 400,
    exclusiveAbilities: ['amun-ra']
}

export const ManionPyrus: bakuganType = {
    key: 'manion-pyrus',
    name: 'Manion',
    family: family,
    attribut: 'Pyrus',
    banList: [],
    canChangeAttribut: false,
    image: 'manion',
    powerLevel: 400,
    exclusiveAbilities: ['amun-ra']
}

export const ManionVentus: bakuganType = {
    key: 'manion-ventus',
    name: 'Manion',
    family: family,
    attribut: 'Ventus',
    banList: [],
    canChangeAttribut: false,
    image: 'manion',
    powerLevel: 400,
    exclusiveAbilities: ['amun-ra']
}

export const ManionGateCard: gateCardType = {
    key: 'manion-gate-card',
    name: 'Charachter: Manion',
    maxInDeck: 1,
    family: family,
    description: `When this card is activated, it doubles the level of all Manion on it.`,
    image: 'caracter-gate-cards/manion-subterra.jpg',
    // imageByAttribut: {
    //     Subterra: CharacterCardByAttribut('manion', 'Subterra'),
    // },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'manion-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null
    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'manion-gate-card')
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
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
}