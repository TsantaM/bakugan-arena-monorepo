import { CharacterCardByAttribut } from "../../function/caracter-cards-image-by-attribut.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { GateCardImages } from "../../store/gate-card-images.js"
import { type bakuganType, type gateCardType } from "../../type/game-data-types.js"

export const LimulusAquos: bakuganType = {
    key: 'limulus-aquos',
    name: 'Limulus',
    image: 'limulus',
    powerLevel: 400,
    family: 'Limulus',
    exclusiveAbilities: ['holograph-divide'],
    attribut: 'Aquos',
    banList: [],
    canChangeAttribut: false
}

export const LimulusGateCard: gateCardType = {
    key: 'limulus-gate-card',
    name: 'Charachter: Limulus',
    maxInDeck: 1,
    family: 'Limulus',
    description: `When this gate card opens on its slot, this card adds Gs to every Limulus Bakugan on that slot equal to their current G-Power at that moment. Requires at least two Bakugan on that slot during battle. The bonus is reversed if this card is nullified.`,
    image: GateCardImages.caracter,
    imageByAttribut: {
        Aquos: CharacterCardByAttribut('limulus', 'Aquos')
    },
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Limulus' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'limulus-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Limulus' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== LimulusGateCard.family) return

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
        if (bakugan.family !== LimulusAquos.family) return

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