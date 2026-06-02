import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js";
import { bakuganType, gateCardType } from "../../type/game-data-types.js";

const family = 'Tuskor'

export const TuskorSubterra: bakuganType = {
    key: 'tuskor-subterra',
    name: 'Tuskor',
    family: family,
    image: 'tuskor',
    canChangeAttribut: false,
    exclusiveAbilities: ['noise-slap'],
    powerLevel: 400,
    banList: [],
    attribut: 'Subterra'
}

export const TuskorPyrus: bakuganType = {
    key: 'tuskor-pyrus',
    name: 'Tuskor',
    family: family,
    image: 'tuskor',
    canChangeAttribut: false,
    exclusiveAbilities: ['noise-slap'],
    powerLevel: 400,
    banList: [],
    attribut: 'Pyrus'
}


export const TuskorDarkus: bakuganType = {
    key: 'tuskor-darkus',
    name: 'Tuskor',
    family: family,
    image: 'tuskor',
    canChangeAttribut: false,
    exclusiveAbilities: ['noise-slap'],
    powerLevel: 400,
    banList: [],
    attribut: 'Darkus'
}


export const TuskorGateCard: gateCardType = {
    key: 'tuskor-gate-card',
    name: 'Charachter: Tuskor',
    maxInDeck: 1,
    family: 'Tuskor',
    description: `When this card is activated, it doubles the level of all Tuskor on it.`,
    image: 'caracter-gate-cards/tuskor-pyrus.jpg',
    imageByAttribut: {
        Darkus: CharacterCardByAttribut('tuskor', 'Darkus'),
        Pyrus: CharacterCardByAttribut('tuskor', 'Pyrus'),
        Subterra: CharacterCardByAttribut('tuskor', 'Subterra')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tuskor-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tuskor-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: family })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

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
}