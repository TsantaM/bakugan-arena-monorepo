import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"

export const LimulusAquos: bakuganType = {
    key: 'limulus-aquos',
    name: 'Limulus',
    image: 'limulus',
    powerLevel: 290,
    family: 'Limulus',
    exclusiveAbilities: ['divisio-holographique'],
    attribut: 'Aquos',
    banList: [],
    canChangeAttribut: false
}

export const LimulusGateCard: gateCardType = {
    key: 'limulus-gate-card',
    name: 'Carte Personnage: Limulus',
    maxInDeck: 1,
    family: 'Limulus',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Limulus présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Limulus' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Limulus' })
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