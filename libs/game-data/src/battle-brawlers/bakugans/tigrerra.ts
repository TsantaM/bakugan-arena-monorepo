import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const TigrerraHaos: bakuganType = {
    key: 'tigrerra-haos',
    name: 'Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra',
    powerLevel: 370,
    family: 'Tigrerra',
    exclusiveAbilities: ['sabre-de-la-mort'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const BladeTigrerraHaos: bakuganType = {
    key: 'blade-tigrerra-haos',
    name: 'Blade Tigrerra',
    attribut: 'Haos',
    image: 'tigrerra-blade',
    powerLevel: 450,
    family: 'Tigrerra',
    exclusiveAbilities: [],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const TigrerraGateCard: gateCardType = {
    key: 'tigrerra-gate-card',
    name: 'Charachter: Tigrerra',
    maxInDeck: 1,
    family: 'Tigrerra',
    description: `When this card is activated, it doubles the level of all Tigrerra on it.`,
    image: 'caracter-gate-cards/tigrerra-haos.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tigrerra' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tigrerra-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tigrerra' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== TigrerraGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            animationsForReplay: roomState.animationsForReplay,
            turn: roomState.turnState.turnCount
        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== TigrerraGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower -= basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: true,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
}