import { CombinationSimpleFunction } from "../../function/ability-cards-effects/combination-simple-effects";
import { type abilityCardsType } from "../../type/game-data-types";

export const SubterraPyrus: abilityCardsType = {
    key: 'combination-subterra-pyrus',
    name: 'Corrélation : Subterra - Pyrus',
    description: `Si un Bakugan Pyrus affronte un bakugan de l'élément Subterra cette carte augmentera sa puissance de 100 G`,
    attribut: 'Pyrus',
    maxInDeck: 1,
    usable_in_neutral: false,
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
    name: 'Corrélation : Subterra - Haos',
    description: `Si un Bakugan Subterra affronte un bakugan de l'élément Haos cette carte augmentera sa puissance de 100 G`,
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
    name: 'Corrélation : Haos - Darkus',
    description: `Si un Bakugan Haos affronte un bakugan de l'élément Darkus cette carte augmentera sa puissance de 100 G`,
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
    name: 'Corrélation : Darkus - Aquos',
    description: `Si un Bakugan Darkus affronte un bakugan de l'élément Aquos cette carte augmentera sa puissance de 100 G`,
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
    name: 'Corrélation : Aquos - Ventus',
    description: `Si un Bakugan Aquos affronte un bakugan de l'élément Ventus cette carte augmentera sa puissance de 100 G`,
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
    name: 'Corrélation : Ventus - Pyrus',
    description: `Si un Bakugan Ventus affronte un bakugan de l'élément Pyrus cette carte augmentera sa puissance de 100 G`,
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