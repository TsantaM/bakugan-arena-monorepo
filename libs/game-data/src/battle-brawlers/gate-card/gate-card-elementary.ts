import { attribut, gateCardType } from "../../type/game-data-types"
import { slots_id, stateType } from "../../type/room-types"
import { BakuganList } from "../bakugans"

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    name: 'Reacteur Pyrus',
    attribut: 'Pyrus',
    description: 'Ajoute 100 G à tous les bakugans Pyrus sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        const attribut: attribut = 'Pyrus'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },
    onCanceled: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {
        const attribut: attribut = 'Pyrus'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }

    },

    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}

export const ReacteurHaos: gateCardType = {
    key: 'reacteur-haos',
    name: 'Reacteur Haos',
    attribut: 'Haos',
    description: 'Ajoute 100 G à tous les bakugans Haos sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        const attribut: attribut = 'Haos'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },
    onCanceled({ roomState, slot }) {
        const attribut: attribut = 'Haos'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}

export const ReacteurVentus: gateCardType = {
    key: 'reacteur-ventus',
    name: 'Reacteur Ventus',
    attribut: 'Ventus',
    description: 'Ajoute 100 G à tous les bakugans Ventus sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Ventus'

        if (slotOfGate && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },

    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Ventus'

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}

export const ReacteurAquos: gateCardType = {
    key: 'reacteur-aquos',
    name: 'Reacteur Aquos',
    attribut: 'Aquos',
    description: 'Ajoute 100 G à tous les bakugans Aquos sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Aquos'

        if (slotOfGate && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },
    onCanceled({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Aquos'

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}

export const ReacteurSubterra: gateCardType = {
    key: 'reacteur-subterra',
    name: 'Reacteur Subterra',
    attribut: 'Subterra',
    description: 'Ajoute 100 G à tous les bakugans Subterra sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {
        const attribut: attribut = 'Subterra'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.canceled) {
            slotOfGate.state.open = true
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },

    onCanceled({ roomState, slot }) {
        const attribut: attribut = 'Subterra'
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            slotOfGate.state.open = true
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }
    },

    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}

export const ReacteurDarkus: gateCardType = {
    key: 'reacteur-darkus',
    name: 'Reacteur darkus',
    attribut: 'Darkus',
    description: 'Ajoute 100 G à tous les bakugans Darkus sur la carte',
    maxInDeck: 3,
    onOpen: ({ roomState, slot }: { roomState: stateType, slot: slots_id }) => {

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Darkus'

        if (slotOfGate && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower += 100)
        }

    },
    onCanceled({ roomState, slot }) {

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const attribut: attribut = 'Darkus'

        if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganWithAttribut = slotOfGate.bakugans.filter((b) => b.attribut === attribut)
            slotOfGate.state.open = true
            bakuganWithAttribut.forEach((b) => b.currentPower -= 100)
        }

    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}


// Carte Péril

export const PerilPyrus: gateCardType = {
    key: 'peril-pyrus',
    name: 'Péril Pyrus',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Pyrus`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
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
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Subterra'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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

export const FusionAerienne: gateCardType = {
    key: 'fusion-aerienne',
    name: 'Fusion Aérienne',
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Ventus sauf les Bakugans Haos`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Haos'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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

export const FusionTenebreuses: gateCardType = {
    key: 'fusion-tenebreuse',
    name: 'Fusion Ténébreuse',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Darkus sauf les Bakugans Pyrus`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Pyrus'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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

export const FusionTerrestre: gateCardType = {
    key: 'fusion-terrestre',
    name: 'Fusion Terrestre',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Subterra sauf les Bakugans Aquos`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Aquos'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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

export const FusionLumineuse: gateCardType = {
    key: 'fusion-lumineuse',
    name: 'Fusion Lumineuse',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Haos sauf les Bakugans Ventus`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Ventus'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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

export const FusionEnflammee: gateCardType = {
    key: 'fusion-enflammee',
    name: 'Fusion Enflammée',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Pyrus sauf les Bakugans Darkus`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const exception: attribut = 'Darkus'
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganOnGate = slotOfGate.bakugans.filter((b) => b.attribut != exception)
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