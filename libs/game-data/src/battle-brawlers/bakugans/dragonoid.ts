import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { StarterBanList } from "../../store/starter-banlist"
import { GateCardImages } from "../../store/gate-card-images"


export const DragonoidPyrus: bakuganType = {
    name: 'Dragonoid',
    attribut: 'Pyrus',
    powerLevel: 340,
    image: 'dragonoid',
    key: 'dragonoid-pyrus',
    family: 'Dragonoid',
    exclusiveAbilities: ['dragonoid-plus'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const DragonoidDeltaPyrus: bakuganType = {
    name: 'Dragonoid Delta',
    attribut: "Pyrus",
    powerLevel: 450,
    image: 'dragonoid-delta',
    key: 'dragonoid-delta-pyrus',
    family: 'Dragonoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const UltimateDragonoid: bakuganType = {
    name: 'Ultimate Dragonoid',
    attribut: 'Pyrus',
    powerLevel: 500,
    image: 'dragonoid-ultimate',
    key: 'ultimate-dragonoid-pyrus',
    family: 'Dragonoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const DragonoidGateCard: gateCardType = {
    key: 'dragonoid-gate-card',
    name: 'Carte Personnage: Dragonoid',
    maxInDeck: 1,
    image: GateCardImages.caracter,
    description: `Lorsque cette carte est activée elle double le niveau de tous les Dragonoid présent sur elle`,
    family: 'Dragonoid',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'dragonoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Dragonoid' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'dragonoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Dragonoid' })
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