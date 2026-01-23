import { CancelCaracterGateCard, CaracterGateCardEffect, GateCardImages, type bakuganType, type gateCardType } from "../../index.js"

export const GriffinPyrus: bakuganType = {
    key: 'griffin-pyrus',
    name: 'Griffin',
    attribut: 'Pyrus',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: ['aile-enflammee'],
    banList: [],
    canChangeAttribut: false
}

export const GriffinHaos: bakuganType = {
    key: 'griffin-haos',
    name: 'Griffin',
    attribut: 'Haos',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const GriffinAquos: bakuganType = {
    key: 'griffin-aquos',
    name: 'Griffin',
    attribut: 'Aquos',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 320,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const GriffinGateCard: gateCardType = {
    key: 'griffin-gate-card',
    name: 'Charachter: Griffin',
    maxInDeck: 1,
    family: 'griffin',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Griffin présent sur elle`,
    image: GateCardImages.caracter,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'griffin-gate-card')
        CaracterGateCardEffect({ roomState: roomState,  slotOfGate: slotOfGate, family: 'griffin' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'griffin-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'griffin' })
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