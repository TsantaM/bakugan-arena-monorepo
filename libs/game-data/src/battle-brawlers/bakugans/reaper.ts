import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"
import { GateCardImages } from "../../store/gate-card-images"

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
    name: 'Carte Personnage: Reaper',
    maxInDeck: 1,
    family: 'Reaper',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Reaper présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'reaper-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Reaper' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'reaper-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Reaper' })
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