import { CancelCaracterGateCard, CaracterGateCardEffect, CheckTwoBakugansAndBattle, PowerChange, PowerChangeDirectiveAnumation, type bakuganType, type gateCardType } from "../../index.js"
import { StarterBanList } from "../../store/store-index.js"

export const HydranoidDarkus: bakuganType = {
    key: 'hydranoid-darkus',
    name: 'Hydranoid',
    attribut: 'Darkus',
    image: 'hydranoid',
    powerLevel: 420,
    family: 'Hydranoid',
    exclusiveAbilities: ['chambre-de-gravité', 'bouclier-fusion', 'chaos-of-darkness', 'destruction-buster'],
    banList: StarterBanList,
    canChangeAttribut: false
}

export const DoubleHydranoidDarkus: bakuganType = {
    key: 'delta-hydranoid-darkus',
    name: 'Dual Hydranoid',
    attribut: 'Darkus',
    image: 'hydranoid-delta',
    powerLevel: 450,
    family: 'Hydranoid',
    exclusiveAbilities: ["dual-gazer", "destruction-impact"],
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
    maxInDeck: 1,
    family: 'Hydranoid',
    image: 'caracter-gate-cards/hydranoid-darkus.jpg',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CaracterGateCardEffect({ roomState: roomState, slotOfGate: slotOfGate, family: 'Hydranoid' })
        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'hydranoid-gate-card')
        CancelCaracterGateCard({ roomState: roomState, slotOfGate: slotOfGate, family: 'Hydranoid' })
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        return CheckTwoBakugansAndBattle({ portalSlot, battleState: roomState.battleState })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state
        
        if (canceled) return
        if (!open) return
        if (bakugan.family !== HydranoidDarkus.family) return

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
        if (bakugan.family !== HydranoidGateCard.family) return

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