import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const TentaclearHaos: bakuganType = {
    key: 'tentaclear-haos',
    name: 'Tentaclear',
    attribut: 'Haos',
    powerLevel: 370,
    family: 'Tentaclear',
    image: 'tentaclear',
    exclusiveAbilities: ['mega-flare-blinder', 'flare-blinder', 'gamma-ray', 'solar-ray'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const TentaclearGateCard: gateCardType = {
    key: 'tentaclear-gate-card',
    name: 'Charachter: Tentaclear',
    maxInDeck: 1,
    family: 'Tentaclear',
    description: `When this card is activated, it doubles the level of all Tentaclear on it.`,
    image: 'caracter-gate-cards/tentaclear-haos.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tentaclear-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tentaclear' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'tentaclear-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Tentaclear' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== TentaclearGateCard.family) return

        const basePower = structuredClone(bakugan.powerLevel)
        if (!basePower) return
        bakugan.currentPower += basePower
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: basePower,
            malus: false,
            turn: roomState.turnState.turnCount,
            animationsForReplay: roomState.animationsForReplay

        })

    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== TentaclearGateCard.family) return

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