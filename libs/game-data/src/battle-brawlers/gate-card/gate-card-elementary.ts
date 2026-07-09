import { DoubleBakuganCheck, ElementaryGateCardOnCancel, ElementaryGateCardOnOpen, PerilGateCardOnCanel, PerilGateCardOnOpen, type gateCardType, type stateType, type slots_id, PowerChangeDirectiveAnumation, } from "../../index.js"
import { BakuganList } from "../bakugans.js"
import { GateCardImages } from "../../store/gate-card-images.js";

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    name: 'Reacteur Pyrus',
    attribut: 'Pyrus',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Pyrus Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Pyrus Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    maxInDeck: 3,
    image: 'reacteur-pyrus.jpg',
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Pyrus' })

        return null

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Pyrus' })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Pyrus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })

    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Pyrus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Pyrus") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })

    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurHaos: gateCardType = {
    key: 'reacteur-haos',
    name: 'Reacteur Haos',
    attribut: 'Haos',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Haos Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Haos Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    image: 'reacteur-haos.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Haos' })

        return null

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Haos") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Haos") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Haos") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })
    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Haos' })

    },

    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurVentus: gateCardType = {
    key: 'reacteur-ventus',
    name: 'Reacteur Ventus',
    attribut: 'Ventus',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Ventus Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Ventus Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    image: 'reacteur-ventus.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Ventus' })

        return null

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Ventus' })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Ventus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Ventus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Ventus") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurAquos: gateCardType = {
    key: 'reacteur-aquos',
    name: 'Reacteur Aquos',
    attribut: 'Aquos',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Aquos Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Aquos Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    image: 'reacteur-aquos.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Aquos' })

        return null

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Aquos' })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Aquos") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Aquos") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Aquos") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurSubterra: gateCardType = {
    key: 'reacteur-subterra',
    name: 'Reacteur Subterra',
    attribut: 'Subterra',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Subterra Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Subterra Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    image: 'reacteur-subterra.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Subterra' })

        return null

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Subterra' })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Subterra") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Subterra") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Subterra") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurDarkus: gateCardType = {
    key: 'reacteur-darkus',
    name: 'Reacteur Darkus',
    attribut: 'Darkus',
    description: `When this gate card opens on its slot, this card adds 100 Gs to every Darkus Bakugan on that slot. Requires at least two Bakugan on that slot. While this card remains open, Darkus Bakugan placed on that slot also gain 100 Gs. The bonus is reversed if this card is nullified.`,
    image: 'reacteur-darkus.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Darkus' })

        return null

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Darkus' })

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Darkus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Darkus") return
        bakugan.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount
        })
    },
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (bakugan.attribut !== "Darkus") return
        bakugan.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount
        })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}


// Carte Péril

export const PerilPyrus: gateCardType = {
    key: 'peril-pyrus',
    name: 'Péril Pyrus',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Pyrus. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Pyrus')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

export const PerilAquos: gateCardType = {
    key: 'peril-aquos',
    name: 'Péril Aquos',
    attribut: 'Aquos',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Aquos. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Aquos')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

export const PerilVentus: gateCardType = {
    key: 'peril-ventus',
    name: 'Péril Ventus',
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Ventus. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Ventus')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

export const PerilSubterra: gateCardType = {
    key: 'peril-subterra',
    name: 'Péril Subterra',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Subterra. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Subterra')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

export const PerilHaos: gateCardType = {
    key: 'peril-haos',
    name: 'Péril Haos',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Haos. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Haos')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

export const PerilDarkus: gateCardType = {
    key: 'peril-darkus',
    name: 'Péril Darkus',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Darkus. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => b.attribut = 'Darkus')
        }

        return null

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans
            slotOfGate.state.open = true
            bakuganOnGate.forEach((b) => {
                const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

                if (attribut) {
                    b.attribut = attribut
                }
            })
        }
    },
}

// Fusions

export const FusionMarine: gateCardType = {
    key: 'fusion-marine',
    name: 'Fusion Marine',
    attribut: 'Aquos',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Aquos, except Subterra Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {

        PerilGateCardOnOpen({ roomState, slot, attribut: "Aquos", exception: "Subterra" })

        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}

export const FusionAerienne: gateCardType = {
    key: 'fusion-aerienne',
    name: 'Fusion Aérienne',
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Ventus, except Haos Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Ventus", exception: "Haos" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}

export const FusionTenebreuses: gateCardType = {
    key: 'fusion-tenebreuse',
    name: 'Fusion Ténébreuse',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Darkus, except Pyrus Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Darkus", exception: "Pyrus" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}

export const FusionTerrestre: gateCardType = {
    key: 'fusion-terrestre',
    name: 'Fusion Terrestre',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Subterra, except Aquos Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Subterra", exception: "Aquos" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}

export const FusionLumineuse: gateCardType = {
    key: 'fusion-lumineuse',
    name: 'Fusion Lumineuse',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Haos, except Ventus Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Haos", exception: "Ventus" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}

export const FusionEnflammee: gateCardType = {
    key: 'fusion-enflammee',
    name: 'Fusion Enflammée',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `When this gate card opens on its slot, this card changes the attribute of every Bakugan on that slot to Pyrus, except Darkus Bakugan. The change is reversed if this card is nullified.`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Pyrus", exception: "Darkus" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}