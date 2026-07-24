import { DoubleBakuganCheck, ElementaryGateCardOnCancel, ElementaryGateCardOnOpen, PerilGateCardOnCanel, PerilGateCardOnOpen, type gateCardType, type stateType, type slots_id, PowerChange, PowerChangeDirectiveAnumation } from "../../index.js"
import { BakuganList } from "../bakugans.js"
import { GateCardImages } from "../../store/gate-card-images.js";

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    attribut: 'Pyrus',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })

    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Pyrus") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })

    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurHaos: gateCardType = {
    key: 'reacteur-haos',
    attribut: 'Haos',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Haos") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
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
    attribut: 'Ventus',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Ventus") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurAquos: gateCardType = {
    key: 'reacteur-aquos',
    attribut: 'Aquos',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Aquos") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurSubterra: gateCardType = {
    key: 'reacteur-subterra',
    attribut: 'Subterra',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Subterra") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
            })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const check = DoubleBakuganCheck({ portalSlot })
        return check
    },
}

export const ReacteurDarkus: gateCardType = {
    key: 'reacteur-darkus',
    attribut: 'Darkus',
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
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
        })
    },
    onAttributChange({ bakugan, slot, attribut, roomState }) {
        if (!roomState) return
        const { canceled, open } = slot.state

        if (canceled) return
        if (!open) return

        if (attribut !== "Darkus") return
        PowerChange({
            roomState,
            bakugan,
            G: 100,
            malus: false,
            origin: 'GATE',
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
            turn: roomState.turnState.turnCount,
            roomState: roomState
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
    attribut: 'Pyrus',
    maxInDeck: 1,
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
    attribut: 'Aquos',
    maxInDeck: 1,
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
    attribut: 'Ventus',
    maxInDeck: 1,
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
    attribut: 'Subterra',
    maxInDeck: 1,
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
    attribut: 'Haos',
    maxInDeck: 1,
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
    attribut: 'Darkus',
    maxInDeck: 1,
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
    attribut: 'Aquos',
    maxInDeck: 1,
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
    attribut: 'Ventus',
    maxInDeck: 1,
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
    attribut: 'Darkus',
    maxInDeck: 1,
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
    attribut: 'Subterra',
    maxInDeck: 1,
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
    attribut: 'Haos',
    maxInDeck: 1,
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
    attribut: 'Pyrus',
    maxInDeck: 1,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Pyrus", exception: "Darkus" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}