import { CancelCaracterGateCard, CaracterGateCardEffect, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js";
import { bakuganType, gateCardType } from "../../type/type-index.js";

const family = "juggernoid"

export const JuggernoidAquos: bakuganType = {
    key: 'juggernoid-aquos',
    attribut: 'Aquos',
    banList: [],
    powerLevel: 350,
    canChangeAttribut: false,
    exclusiveAbilities: ['depth-tornado'],
    family: family,
    image: 'juggernoid',
    name: 'Juggernoid'
}

export const JuggernoidHaos: bakuganType = {
    key: 'juggernoid-haos',
    attribut: 'Haos',
    banList: [],
    powerLevel: 350,
    canChangeAttribut: false,
    exclusiveAbilities: ['guardian-field'],
    family: family,
    image: 'juggernoid',
    name: 'Juggernoid'
}

export const JuggernoidGateCard: gateCardType = {
    key: 'juggernoid-gate-card',
    name: 'Charachter: Juggernoid',
    maxInDeck: 1,
    family: family,
    description: `When this card is activated, it doubles the level of all Juggernoid on it.`,
    image: 'juggernoid.png',
    imageByAttribut: {
        Aquos: CharacterCardByAttribut('juggernoid', 'Aquos'),
        Haos: CharacterCardByAttribut('juggernoid', 'Haos')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === JuggernoidGateCard.key)
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: family })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === JuggernoidGateCard.key)
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: family })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== family) return

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
        if (bakugan.family !== family) return

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