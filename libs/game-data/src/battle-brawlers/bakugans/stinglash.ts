import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"


export const StinglashAquos: bakuganType = {
    key: 'stinglash-aquos',
    name: 'Stinglash',
    attribut: 'Aquos',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: ['maitre-des-profondeurs'],
    powerLevel: 350,
    banList: [],
    canChangeAttribut: false
}

export const StinglashDarkus: bakuganType = {
    key: 'stinglash-darkus',
    name: 'Stinglash',
    attribut: 'Darkus',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 350,
    banList: [],
    canChangeAttribut: false
}


export const StinglashSubterra: bakuganType = {
    key: 'stinglash-subterra',
    name: 'Stinglash',
    attribut: 'Subterra',
    image: 'stinglash',
    family: 'Stinglash',
    exclusiveAbilities: [],
    powerLevel: 350,
    banList: [],
    canChangeAttribut: false
}

export const StinglashGateCard: gateCardType = {
    key: 'stinglash-gate-card',
    name: 'Charachter: Stinglash',
    maxInDeck: 1,
    family: 'Stinglash',
    description: `When this card is activated, it doubles the level of all Stinglash on it.`,
    image: GateCardImages.caracter,
    imageByAttribut: {
        Aquos: CharacterCardByAttribut('stinglash', 'Aquos'),
        Darkus: CharacterCardByAttribut('stinglash', 'Darkus'),
        Subterra: CharacterCardByAttribut('stinglash', 'Subterra'),
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'stinglash-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Stinglash' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'stinglash-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Stinglash' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== StinglashGateCard.family) return

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
        if (bakugan.family !== StinglashGateCard.family) return

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