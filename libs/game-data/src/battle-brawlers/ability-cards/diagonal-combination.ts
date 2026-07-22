import { AbilityCardFailed, DiagonalCombinationEffect } from "../../function/index.js";
import type { abilityCardsType, attribut } from "../../type/type-index.js";

export const PyrusDarkus: abilityCardsType = {
    key: 'diagonal-combination-pyrus-darkus',
    attribut: 'Pyrus',
    maxInDeck: 1,
    usable_in_neutral: true,
    image: "pyrus-darkus.jpg",
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const failed = AbilityCardFailed({ abilityKey: PyrusDarkus.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Pyrus', attributWeak: 'Darkus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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
    attribut: 'Darkus',
    maxInDeck: 1,
    usable_in_neutral: true,
    image: "pyrus-darkus.jpg",
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ abilityKey: DarkusPyrus.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Darkus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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
    attribut: 'Ventus',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ abilityKey: VentusHaos.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Ventus', attributWeak: 'Haos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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
    attribut: 'Haos',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ abilityKey: HaosVentus.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Haos', attributWeak: 'Ventus', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ abilityKey: AquosSubterra.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Aquos', attributWeak: 'Subterra', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ abilityKey: SubterraAquos.key })

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
        DiagonalCombinationEffect({ roomState: roomState, animations: roomState.animations, attribut: 'Subterra', attributWeak: 'Aquos', bakuganKey: bakuganKey, portalSlots: portalSlots, slotOfGate: slotOfGate, userId: userId, turn: roomState.turnState.turnCount })
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