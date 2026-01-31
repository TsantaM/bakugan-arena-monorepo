import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"


export const ReaperDarkus: bakuganType = {
    key: 'reaper-darkus',
    name: 'Reaper',
    attribut: 'Darkus',
    family: 'Reaper',
    powerLevel: 370,
    image: 'reaper',
    exclusiveAbilities: ['dimmension-quatre'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const ReaperGateCard: gateCardType = {
    key: 'reaper-gate-card',
    name: 'Charachter: Reaper',
    maxInDeck: 1,
    family: 'Reaper',
    description: `When this card is activated, it doubles the level of all Reaper on it.`,
    image: 'reaper.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'reaper-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Reaper' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'reaper-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Reaper' })
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