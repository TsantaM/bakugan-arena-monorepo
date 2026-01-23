import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/index.js'
import { GateCardImages, StarterBanList } from "../../store/store-index.js"

export const CycloidSubterra: bakuganType = {
    key: 'cycloid-subterra',
    name: 'Cycloid',
    family: 'Cycloid',
    image: 'cycloid',
    attribut: 'Subterra',
    powerLevel: 370,
    exclusiveAbilities: ['gauche-gigantesque', 'massue-gigantesque'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const CycloidGateCard: gateCardType = {
    key: 'cycloid-gate-card',
    name: 'Charachter: Cycloid',
    maxInDeck: 1,
    family: 'Cycloid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Cycloid présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'cycloid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Cycloid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'cycloid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Cycloid' })
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