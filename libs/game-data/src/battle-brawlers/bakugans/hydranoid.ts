import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CancelCaracterGateCard, CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'
import { GateCardImages } from "../../store/gate-card-images"
import { StarterBanList } from "../../store/starter-banlist"

export const HydranoidDarkus: bakuganType = {
    key: 'hydranoid-darkus',
    name: 'Hydranoid',
    attribut: 'Darkus',
    image: 'hydranoid',
    powerLevel: 340,
    family: 'Hydranoid',
    exclusiveAbilities: ['chambre-de-gravité'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const DeltaHydranoidDarkus: bakuganType = {
    key: 'delta-hydranoid-darkus',
    name: 'Hydranoid Delta',
    attribut: 'Darkus',
    image: 'hydranoid-delta',
    powerLevel: 450,
    family: 'Hydranoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const AlphaHydranoidDarkus: bakuganType = {
    key: 'alpha-hydranoid-darkus',
    name: 'Hydranoid Alpha',
    attribut: 'Darkus',
    image: 'hydranoid-alpha',
    powerLevel: 500,
    family: 'Hydranoid',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HydranoidGateCard: gateCardType = {
    key: 'hydranoid-gate-card',
    name: 'Carte Personnage: Hydranoid',
    maxInDeck: 1,
    family: 'Hydranoid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Hydranoid présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Hydranoid' })

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Hydranoid' })
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