import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { GateCardImages } from "../../store/gate-card-images.js"

export const GriffinPyrus: bakuganType = {
    key: 'griffin-pyrus',
    name: 'Griffin',
    attribut: 'Pyrus',
    family: 'griffin',
    image: 'griffin',
    powerLevel: 370,
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
    powerLevel: 370,
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
    powerLevel: 370,
    exclusiveAbilities: [],
    banList: [],
    canChangeAttribut: false
}

export const GriffinGateCard: gateCardType = {
    key: 'griffin-gate-card',
    name: 'Charachter: Griffin',
    maxInDeck: 1,
    family: 'griffin',
    description: `When this card is activated, it doubles the level of all Griffin on it.`,
    image: GateCardImages.caracter,
    imageByAttribut: {
        Haos: CharacterCardByAttribut('griffin', 'Haos'),
        Pyrus: CharacterCardByAttribut('griffin', 'Pyrus'),
        Aquos: CharacterCardByAttribut('griffin', 'Aquos')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'griffin-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'griffin' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'griffin-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'griffin' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== GriffinGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            turn: roomState.turnState.turnCount
        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== GriffinAquos.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount
        })

    },
}