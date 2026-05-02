import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"

export const FearReaperPyrus: bakuganType = {
    key: 'fear-reaper-pyrus',
    name: 'Fear Ripper',
    image: 'fear-reaper',
    attribut: 'Pyrus',
    family: 'Fear Reaper',
    powerLevel: 330,
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
    powerLevel: 330,
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
    powerLevel: 330,
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
    powerLevel: 330,
    exclusiveAbilities: ['slash-zero'],
    banList: [],
    canChangeAttribut: false
}

export const FearReaperGateCard: gateCardType = {
    key: 'fear-reaper-gate-card',
    name: 'Charachter: Fear Ripper',
    maxInDeck: 1,
    description: `When this card is activated, it doubles the level of all Fear Reaper on it.`,
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
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== FearReaperAquos.family) return

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
        if (bakugan.family !== FearReaperAquos.family) return

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