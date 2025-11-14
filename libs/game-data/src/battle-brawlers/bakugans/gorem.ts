import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"
import { GateCardImages } from "../../store/gate-card-images"

export const GoremSubterra: bakuganType = {
    key: 'gorem-subterra',
    name: 'Gorem',
    attribut: 'Subterra',
    image: 'gorem',
    powerLevel: 380,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HammerGoremSubterra: bakuganType = {
    key: 'hammer-gorem-subterra',
    name: 'Hammer Gorem',
    attribut: 'Subterra',
    image: 'gorem-hammer',
    powerLevel: 450,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const GoremGateCard: gateCardType = {
    key: 'gorem-gate-card',
    name: 'Carte Personnage: Gorem',
    maxInDeck: 1,
    family: 'Gorem',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Gorem présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Gorem' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Gorem' })
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