import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"


export const RavenoidPyrus: bakuganType = {
    key: 'ravenoid-pyrus',
    name: 'Ravenoid',
    attribut: 'Pyrus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidVentus: bakuganType = {
    key: 'ravenoid-ventus',
    name: 'Ravenoid',
    attribut: 'Ventus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidHaos: bakuganType = {
    key: 'ravenoid-haos',
    name: 'Ravenoid',
    attribut: 'Haos',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidGateCard: gateCardType = {
    key: 'ravenoid-gate-card',
    name: 'Charachter: Ravenoid',
    maxInDeck: 1,
    family: 'Ravenoid',
    description: `When this card is activated, it doubles the level of all Ravenoid on it.`,
    image: 'ravenoid.png',
    imageByAttribut: {
        Ventus: CharacterCardByAttribut('ravenoid', 'Ventus'),
        Pyrus: CharacterCardByAttribut('ravenoid', 'Pyrus'),
        Haos: CharacterCardByAttribut('ravenoid', 'Aquos')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'ravenoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Ravenoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'ravenoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Ravenoid' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== RavenoidGateCard.family) return

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
        if (bakugan.family !== RavenoidGateCard.family) return

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