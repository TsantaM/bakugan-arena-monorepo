import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"
import { GateCardImages } from "../../store/gate-card-images"

export const HarpusVentus: bakuganType = {
    key: 'harpus-ventus',
    name: 'Harpus',
    attribut: 'Ventus',
    image: 'harpus',
    family: 'Harpus',
    powerLevel: 370,
    exclusiveAbilities: ['tempête-de-plume'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HarpusGateCard: gateCardType = {
    key: 'harpus-gate-card',
    name: 'Carte Personnage: Gorem',
    maxInDeck: 1,
    family: 'Harpus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Harpus présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Harpus' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'harpus-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'Harpus' })
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