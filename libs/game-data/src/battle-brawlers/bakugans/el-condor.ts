import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { GateCardImages } from "../../store/store-index.js"
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"

export const ElCondorHaos: bakuganType = {
    key: 'el-condor-haos',
    name: 'El Condor',
    attribut: 'Haos',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorVentus: bakuganType = {
    key: 'el-condor-ventus',
    name: 'El Condor',
    attribut: 'Ventus',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire', 'souffle-infini'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorSubterra: bakuganType = {
    key: 'el-condor-subterra',
    name: 'El Condor',
    attribut: 'Subterra',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire', 'obstruction'],
    powerLevel: 310,
    banList: [],
    canChangeAttribut: false
}

export const ElCondorGateCard: gateCardType = {
    key: 'el-condor-gate-card',
    name: 'Charachter: El Condor',
    maxInDeck: 1,
    image: GateCardImages.caracter,
    imageByAttribut: {
        Subterra: CharacterCardByAttribut('el-condor', 'Subterra'),
        Haos: CharacterCardByAttribut('el-condor', 'Haos'),
        Ventus: CharacterCardByAttribut('el-condor', 'Ventus')
    },
    description: `When this card is activated, it doubles the level of all El Condor on it.`,
    family: 'El Condor',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'el-condor-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'El Condor' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'el-condor-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'El Condor' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== ElCondorHaos.family) return

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
        if (bakugan.family !== ElCondorHaos.family) return

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