import { DiagonalCombinationEffect } from "../../function/index.js";
import type { abilityCardsType } from "../../type/type-index.js";

export const PyrusDarkus: abilityCardsType = {
    key: 'diagonal-combination-pyrus-darkus',
    name: 'Diagonal Correlation : Pyrus - Darkus',
    attribut: 'Pyrus',
    description: `If the user is of the Pyrus attribut, they gain a 100 Gs bonus if a Darkus Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    image: "pyrus-darkus.jpg",
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Pyrus', attributWeak: 'Darkus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}

export const DarkusPyrus: abilityCardsType = {
    key: 'diagonal-combination-darkus-pyrus',
    name: 'Diagonal Correlation : Pyrus - Darkus',
    attribut: 'Darkus',
    description: `If the user is of the Darkus attribut, they gain a 100 Gs bonus if a Pyrus Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    image: "pyrus-darkus.jpg",
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Darkus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}

export const VentusHaos: abilityCardsType = {
    key: 'diagonal-combination-ventus-haos',
    name: 'Diagonal Correlation : Ventus - Haos',
    attribut: 'Ventus',
    description: `If the user is of the Ventus attribut, they gain a 100 Gs bonus if a Haos Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Ventus', attributWeak: 'Haos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}

export const HaosVentus: abilityCardsType = {
    key: 'diagonal-combination-haos-ventus',
    name: 'Diagonal Correlation : Ventus - Haos',
    attribut: 'Haos',
    description: `If the user is of the Haos attribut, they gain a 100 Gs bonus if a Ventus Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Haos', attributWeak: 'Ventus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}

export const AquosSubterra: abilityCardsType = {
    key: 'diagonal-combination-aquos-subterra',
    name: 'Diagonal Correlation : Aquos - Subterra',
    attribut: 'Aquos',
    description: `If the user is of the Aquos attribut, they gain a 100 Gs bonus if a Subterra Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Aquos', attributWeak: 'Subterra', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}

export const SubterraAquos: abilityCardsType = {
    key: 'diagonal-combination-subterra-aquos',
    name: 'Diagonal Correlation : Aquos - Subterra',
    attribut: 'Aquos',
    description: `If the user is of the Subterra attribut, they gain a 100 Gs bonus if a Aquos Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return null
        if (!slotOfGate) return null
        if (!portalSlots) return null
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Subterra', attributWeak: 'Aquos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
}