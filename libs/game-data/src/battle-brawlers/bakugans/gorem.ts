import { bakuganType, CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, gateCardType, PowerChange, PowerChangeDirectiveAnumation } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const GoremSubterra: bakuganType = {
    key: 'gorem-subterra',
    name: 'Gorem',
    attribut: 'Subterra',
    image: 'gorem',
    powerLevel: 420,
    family: 'Gorem',
    exclusiveAbilities: ['impact-majeur'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const HammerGoremSubterra: bakuganType = {
    key: 'hammer-gorem-subterra',
    name: 'Hammer Gorem',
    attribut: 'Subterra',
    image: 'gorem-hammer',
    powerLevel: 450,
    family: 'Gorem',
    exclusiveAbilities: ['grand-impact'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const GoremGateCard: gateCardType = {
    key: 'gorem-gate-card',
    maxInDeck: 1,
    family: 'Gorem',
    image: 'caracter-gate-cards/gorem-subterra.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Gorem' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'gorem-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Gorem' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== GoremGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        PowerChange({
            roomState,
            bakugan,
            G: basePower,
            malus: false,
        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== GoremGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })

    },
}