import { bakuganType, gateCardType } from "../../type/type-index.js"
import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChangeDirectiveAnumation } from '../../function/index.js'
import { GateCardImages, StarterBanList } from "../../store/store-index.js"

export const CycloidSubterra: bakuganType = {
    key: 'cycloid-subterra',
    name: 'Cycloid',
    family: 'Cycloid',
    image: 'cycloid',
    attribut: 'Subterra',
    powerLevel: 420,
    exclusiveAbilities: ['gauche-gigantesque', 'massue-gigantesque'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const CycloidGateCard: gateCardType = {
    key: 'cycloid-gate-card',
    name: 'Charachter: Cycloid',
    maxInDeck: 1,
    family: 'Cycloid',
    description: `When this gate card opens on its slot, this card adds Gs to every Cycloid Bakugan on that slot equal to their current G-Power at that moment. Requires at least two Bakugan on that slot during battle. The bonus is reversed if this card is nullified.`,
    image: 'caracter-gate-cards/cycloid-subterra.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'cycloid-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Cycloid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'cycloid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Cycloid' })
    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== CycloidSubterra.family) return

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
        if (bakugan.family !== CycloidSubterra.family) return

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
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
}