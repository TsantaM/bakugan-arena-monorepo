import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"


export const SiegePyrus: bakuganType = {
    key: 'siege-pyrus',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Pyrus',
    image: 'siege',
    exclusiveAbilities: ['lance-de-feu'],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeAquos: bakuganType = {
    key: 'siege-aquos',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Aquos',
    image: 'siege',
    exclusiveAbilities: ['javelot-aquos', 'tsunami'],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeHaos: bakuganType = {
    key: 'siege-haos',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Haos',
    image: 'siege',
    exclusiveAbilities: [],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeDarkus: bakuganType = {
    key: 'siege-darkus',
    name: 'Siege',
    family: 'Siege',
    attribut: 'Darkus',
    image: 'siege',
    exclusiveAbilities: [],
    powerLevel: 330,
    banList: [],
    canChangeAttribut: false
}

export const SiegeGateCard: gateCardType = {
    key: 'siege-gate-card',
    name: 'Charachter: Siege',
    maxInDeck: 1,
    family: 'Siege',
    description: `When this card is activated, it doubles the level of all Siege on it.`,
    image: 'siege.png',
    imageByAttribut: {
        Pyrus: CharacterCardByAttribut('siege', 'Pyrus'),
        Aquos: CharacterCardByAttribut('siege', 'Aquos'),
        Darkus: CharacterCardByAttribut('siege', 'Darkus'),
        Haos: CharacterCardByAttribut('siege', 'Haos'),
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'siege-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Siege' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'siege-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Siege' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== SiegeGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== SiegeGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
}