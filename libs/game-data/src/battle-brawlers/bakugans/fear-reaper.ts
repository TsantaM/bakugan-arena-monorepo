import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"

export const FearReaperPyrus: bakuganType = {
    key: 'fear-reaper-pyrus',
    name: 'Fear Ripper',
    image: 'fear-reaper',
    attribut: 'Pyrus',
    family: 'Fear Reaper',
    powerLevel: 380,
    exclusiveAbilities: ['slash-zero'],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperHaos: bakuganType = {
    key: 'fear-reaper-haos',
    name: 'Fear Ripper',
    image: 'fear-reaper',
    attribut: 'Haos',
    family: 'Fear Reaper',
    powerLevel: 380,
    exclusiveAbilities: ['slash-zero'],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperDarkus: bakuganType = {
    key: 'fear-reaper-darkus',
    name: 'Fear Ripper',
    image: 'fear-reaper',
    attribut: 'Darkus',
    family: 'Fear Reaper',
    powerLevel: 380,
    exclusiveAbilities: ['slash-zero'],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperAquos: bakuganType = {
    key: 'fear-reaper-aquos',
    name: 'Fear Ripper',
    image: 'fear-reaper',
    attribut: 'Aquos',
    family: 'Fear Reaper',
    powerLevel: 380,
    exclusiveAbilities: ['slash-zero'],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperGateCard: gateCardType = {
    key: 'fear-reaper-gate-card',
    maxInDeck: 1,
    family: 'Fear Reaper',
    image: 'fear-reaper.png',
    imageByAttribut: {
        Aquos: CharacterCardByAttribut('fear-reaper', 'Aquos'),
        Pyrus: CharacterCardByAttribut('fear-reaper', 'Pyrus'),
        Haos: CharacterCardByAttribut('fear-reaper', 'Haos'),
        Darkus: CharacterCardByAttribut('fear-reaper', 'Darkus')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fear-reaper-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Fear Reaper' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'fear-reaper-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Fear Reaper' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== FearReaperAquos.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        PowerChange({
            roomState,
            bakugan,
            G: basePower,
            malus: false,
        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== FearReaperAquos.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })

    },
}