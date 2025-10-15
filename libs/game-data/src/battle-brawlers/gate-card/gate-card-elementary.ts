import { DoubleBakuganCheck, ElementaryGateCardOnCancel, ElementaryGateCardOnOpen, PerilGateCardOnCanel, PerilGateCardOnOpen } from "../../function/gate-card-effects/elementary-gate-card-function"
import { GateCardImages } from "../../store/gate-card-images"
import { attribut, gateCardType } from "../../type/game-data-types"
import { slots_id, stateType } from "../../type/room-types"
import { BakuganList } from "../bakugans"

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    name: 'Reacteur Pyrus',
    attribut: 'Pyrus',
    description: 'Ajoute 100 G à tous les bakugans Pyrus sur la carte',
    maxInDeck: 3,
    image: GateCardImages.elementary,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Pyrus' })

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Pyrus' })

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
    description: 'Ajoute 100 G à tous les bakugans Haos sur la carte',
    image: GateCardImages.elementary,
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Haos' })

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
    description: 'Ajoute 100 G à tous les bakugans Ventus sur la carte',
    image: GateCardImages.elementary,
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Ventus' })

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Ventus' })

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
    description: 'Ajoute 100 G à tous les bakugans Aquos sur la carte',
    image: GateCardImages.elementary,
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Aquos' })

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Aquos' })

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
    description: 'Ajoute 100 G à tous les bakugans Subterra sur la carte',
    image: GateCardImages.elementary,
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Subterra' })

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Subterra' })

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
    description: 'Ajoute 100 G à tous les bakugans Darkus sur la carte',
    image: GateCardImages.elementary,
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnOpen({ roomState, slot, attribut: 'Darkus' })

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        ElementaryGateCardOnCancel({ roomState, slot, attribut: 'Darkus' })

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

    },
    onCanceled({ roomState, slot }) {
        PerilGateCardOnCanel({ roomState, slot })
    },
}