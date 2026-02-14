import { AbilityCardFailed, DiagonalCombinationEffect } from "../../function/index.js";
import type { abilityCardsType, attribut } from "../../type/type-index.js";

export const PyrusDarkus: abilityCardsType = {
    key: 'diagonal-combination-pyrus-darkus',
    name: 'Diagonal Correlation : Pyrus - Darkus',
    attribut: 'Pyrus',
    description: `If the user is of the Pyrus attribut, they gain a 100 Gs bonus if a Darkus Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    image: "pyrus-darkus.jpg",
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const failed = AbilityCardFailed({ card: PyrusDarkus.name })

        if (PyrusDarkus.activationConditions) {
            const checker = PyrusDarkus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Pyrus', attributWeak: 'Darkus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Pyrus', 'Darkus']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
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
        const failed = AbilityCardFailed({ card: DarkusPyrus.name })

        if (DarkusPyrus.activationConditions) {
            const checker = DarkusPyrus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Darkus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Pyrus', 'Darkus']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false


        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const VentusHaos: abilityCardsType = {
    key: 'diagonal-combination-ventus-haos',
    name: 'Diagonal Correlation : Ventus - Haos',
    attribut: 'Ventus',
    description: `If the user is of the Ventus attribut, they gain a 100 Gs bonus if a Haos Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: VentusHaos.name })

        if (VentusHaos.activationConditions) {
            const checker = VentusHaos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Ventus', attributWeak: 'Haos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Ventus', 'Haos']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false


        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const HaosVentus: abilityCardsType = {
    key: 'diagonal-combination-haos-ventus',
    name: 'Diagonal Correlation : Ventus - Haos',
    attribut: 'Haos',
    description: `If the user is of the Haos attribut, they gain a 100 Gs bonus if a Ventus Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: HaosVentus.name })

        if (HaosVentus.activationConditions) {
            const checker = HaosVentus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Haos', attributWeak: 'Ventus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Haos', 'Ventus']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const AquosSubterra: abilityCardsType = {
    key: 'diagonal-combination-aquos-subterra',
    name: 'Diagonal Correlation : Aquos - Subterra',
    attribut: 'Aquos',
    description: `If the user is of the Aquos attribut, they gain a 100 Gs bonus if a Subterra Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: AquosSubterra.name })

        if (AquosSubterra.activationConditions) {
            const checker = AquosSubterra.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Aquos', attributWeak: 'Subterra', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Aquos', 'Subterra']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false


        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const SubterraAquos: abilityCardsType = {
    key: 'diagonal-combination-subterra-aquos',
    name: 'Diagonal Correlation : Aquos - Subterra',
    attribut: 'Aquos',
    description: `If the user is of the Subterra attribut, they gain a 100 Gs bonus if a Aquos Bakugan is present anywhere on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: SubterraAquos.name })

        if (SubterraAquos.activationConditions) {
            const checker = SubterraAquos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        if (!roomState) return failed
        const portalSlots = roomState?.protalSlots
        const slotOfGate = portalSlots?.find((p) => p.id === slot)
        if (!slotOfGate && !portalSlots) return failed
        if (!slotOfGate) return failed
        if (!portalSlots) return failed
        DiagonalCombinationEffect({ animations: roomState.animations, attribut: 'Subterra', attributWeak: 'Aquos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Subterra', 'Aquos']
        const usersBakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = attributs.every(attr =>
            usersBakugans.some(b => b.attribut === attr)
        )

        if (!battleInProcess || paused) return false
        if (!hasAllAttributs) return false


        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}