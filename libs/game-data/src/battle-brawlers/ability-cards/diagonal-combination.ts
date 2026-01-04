import { DiagonalCombinationEffect } from "../../function/ability-cards-effects/diagonal-combination-effect";
import type { abilityCardsType } from "../../type/game-data-types";

export const PyrusDarkus: abilityCardsType = {
    key: 'diagonal-combination-pyrus-darkus',
    name: 'Corrélation Diagonal : Pyrus - Darkus',
    attribut: 'Pyrus',
    description: `Si l'utilisateur est de l'attribut Pyrus, il se verra octroyer un bonus de 100 G si un Bakugan Darkus est présent n'importe où sur le domaine`,
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
    name: 'Corrélation Diagonal : Pyrus - Darkus',
    attribut: 'Darkus',
    description: `Si l'utilisateur est de l'attribut Darkus, il se verra octroyer un bonus de 100 G si un Bakugan Pyrus est présent n'importe où sur le domaine`,
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
    name: 'Corrélation Diagonal : Ventus - Haos',
    attribut: 'Ventus',
    description: `Si l'utilisateur est de l'attribut Ventus, il se verra octroyer un bonus de 100 G si un Bakugan Haos est présent n'importe où sur le domaine`,
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
    name: 'Corrélation Diagonal : Ventus - Haos',
    attribut: 'Haos',
    description: `Si l'utilisateur est de l'attribut Haos, il se verra octroyer un bonus de 100 G si un Bakugan Ventus est présent n'importe où sur le domaine`,
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
    name: 'Corrélation Diagonal : Aquos - Subterra',
    attribut: 'Aquos',
    description: `Si l'utilisateur est de l'attribut Aquos, il se verra octroyer un bonus de 100 G si un Bakugan Subterra est présent n'importe où sur le domaine`,
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
    name: 'Corrélation Diagonal : Aquos - Subterra',
    attribut: 'Aquos',
    description: `Si l'utilisateur est de l'attribut Subterra, il se verra octroyer un bonus de 100 G si un Bakugan Aquos est présent n'importe où sur le domaine`,
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