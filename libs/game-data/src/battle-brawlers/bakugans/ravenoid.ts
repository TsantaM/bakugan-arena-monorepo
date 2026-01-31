import { CancelCaracterGateCard, CaracterGateCardEffect, type bakuganType, type gateCardType } from "../../index.js"


export const RavenoidPyrus: bakuganType = {
    key: 'ravenoid-pyrus',
    name: 'Ravenoid',
    attribut: 'Pyrus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidVentus: bakuganType = {
    key: 'ravenoid-ventus',
    name: 'Ravenoid',
    attribut: 'Ventus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidHaos: bakuganType = {
    key: 'ravenoid-haos',
    name: 'Ravenoid',
    attribut: 'Haos',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`],
    banList: [],
    canChangeAttribut: false
}

export const RavenoidGateCard: gateCardType = {
    key: 'ravenoid-gate-card',
    name: 'Charachter: Ravenoid',
    maxInDeck: 1,
    family: 'Ravenoid',
    description: `When this card is activated, it doubles the level of all Ravenoid on it.`,
    image: 'ravenoid.png',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'ravenoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'Ravenoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'ravenoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Ravenoid' })
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