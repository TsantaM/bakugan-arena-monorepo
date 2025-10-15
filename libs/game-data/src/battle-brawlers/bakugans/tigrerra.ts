import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"
import { GateCardImages } from "../../store/gate-card-images"

export const TigrerraHaos: bakuganType = {
    key: 'tigrerra-haos',
    name: 'Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra',
    powerLevel: 340,
    family: 'Tigrerra',
    exclusiveAbilities: ['sabre-de-la-mort'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const BladeTigrerraHaos: bakuganType = {
    key: 'blade-tigrerra-haos',
    name: 'Blade Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra-blade',
    powerLevel: 450,
    family: 'Tigrerra',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const TigrerraGateCard: gateCardType = {
    key: 'tigrerra-gate-card',
    name: 'Carte Personnage: Tigrerra',
    maxInDeck: 1,
    family: 'Tigrerra',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Tigrerra présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Tigrerra' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Tigrerra' })
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