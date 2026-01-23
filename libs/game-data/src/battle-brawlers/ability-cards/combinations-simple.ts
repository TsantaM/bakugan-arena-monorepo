import { CombinationSimpleFunction } from "../../function/index.js";
import { type abilityCardsType } from "../../type/type-index.js";

export const SubterraPyrus: abilityCardsType = {
    key: 'combination-subterra-pyrus',
    name: 'Correlation : Subterra - Pyrus',
    description: `If a Pyrus Bakugan bettles a Subterra Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Pyrus',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: 'CorrelationPyrusSubterra.png',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Pyrus', attributWeak: 'Subterra', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}

export const SubterraHaos: abilityCardsType = {
    key: 'combination-subterra-haos',
    name: 'Correlation : Subterra - Haos',
    description: `If a Subterra Bakugan bettles Haos Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Subterra',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Subterra', attributWeak: 'Haos', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}

export const HaosDarkus: abilityCardsType = {
    key: 'combination-haos-darkus',
    name: 'Correlation : Haos - Darkus',
    description: `If a Haos Bakugan bettles a Darkus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Haos',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Haos', attributWeak: 'Darkus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}

export const DarkusAquos: abilityCardsType = {
    key: 'combination-darkus-aquos',
    name: 'Correlation : Darkus - Aquos',
    description: `If a Darkus Bakugan bettles a Aquos Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Darkus',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Darkus', attributWeak: 'Aquos', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}

export const AquosVentus: abilityCardsType = {
    key: 'combination-aquos-ventus',
    name: 'Correlation : Aquos - Ventus',
    description: `If a Aquos Bakugan bettles a Ventus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Aquos', attributWeak: 'Ventus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}

export const VentusPyrus: abilityCardsType = {
    key: 'combination-ventus-pyrus',
    name: 'Correlation : Ventus - Pyrus',
    description: `If a Ventus Bakugan bettles a Pyrus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Pyrus',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return null
        if (!slotOfGate) return null
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Ventus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
}