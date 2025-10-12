import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const SirenoidAquos: bakuganType = {
    key: 'sirenoid-aquos',
    name: 'Sirenoid',
    attribut: 'Aquos',
    image: 'sirenoid',
    family: 'sirenoid',
    powerLevel: 370,
    exclusiveAbilities: ['anti-muse']
}

export const SirenoidGateCard: gateCardType = {
    key: 'sirenoid-gate-card',
    name: 'Carte Personnage: Sirenoid',
    maxInDeck: 1,
    family: 'sirenoid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Sirenoid présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'sirenoid-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'sirenoid' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'sirenoid-gate-card')
        CancelCaracterGateCard({ slotOfGate: slotOfGate, family: 'sirenoid' })
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