import { DoubleBakuganCheck, ElementaryGateCardOnCancel, ElementaryGateCardOnOpen, PerilGateCardOnCanel, PerilGateCardOnOpen, type gateCardType, type stateType, type slots_id, PowerChangeDirectiveAnumation, } from "../../index.js"
import { BakuganList } from "../bakugans.js"
import { GateCardImages } from "../../store/gate-card-images.js";

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    name: 'Reacteur Pyrus',
    attribut: 'Pyrus',
    description: 'Add 100 G to all Pyrus bakugans on the card',
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
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {

        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: 'Add 100 G to all Haos bakugans on the card',
    image: 'reacteur-haos.jpg',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Haos' })

        return null

    },
    onSetBakuganOnSlot({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: 'Add 100 G to all Ventus bakugans on the card',
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
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: 'Add 100 G to all Aquos bakugans on the card',
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
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: 'Add 100 G to all Subterra bakugans on the card',
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
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: 'Add 100 G to all Darkus bakugans on the card',
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
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    onRemoveBakugan({ bakugan, slot, roomState }) {
        if (!roomState) return
        const { blocked, canceled, open } = slot.state
        if (blocked) return
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Pyrus`,
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Aquos`,
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Ventus`,
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Subterra`,
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Haos`,
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
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Darkus`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Aquos sauf les Bakugans Subterra`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Ventus sauf les Bakugans Haos`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Darkus sauf les Bakugans Pyrus`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Subterra sauf les Bakugans Aquos`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Haos sauf les Bakugans Ventus`,
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
    description: `Transforme l'attribut de tous les Bakugans présents en Pyrus sauf les Bakugans Darkus`,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }) => {
        PerilGateCardOnOpen({ roomState, slot, attribut: "Pyrus", exception: "Darkus" })
        return null

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}