import { AbilityCardFailed, CombinationSimpleFunction } from "../../function/index.js";
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

        const failed = AbilityCardFailed({ card: SubterraPyrus.name })

        if (SubterraPyrus.activationConditions) {
            const checker = SubterraPyrus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed

        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Pyrus', attributWeak: 'Subterra', bakuganKey: bakuganKey, userId: userId })
        return null

    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Pyrus')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Subterra')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const SubterraHaos: abilityCardsType = {
    key: 'combination-subterra-haos',
    name: 'Correlation : Subterra - Haos',
    description: `If a Subterra Bakugan bettles Haos Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Subterra',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: SubterraHaos.name })

        if (SubterraHaos.activationConditions) {
            const checker = SubterraHaos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Subterra', attributWeak: 'Haos', bakuganKey: bakuganKey, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Subterra')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Haos')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const HaosDarkus: abilityCardsType = {
    key: 'combination-haos-darkus',
    name: 'Correlation : Haos - Darkus',
    description: `If a Haos Bakugan bettles a Darkus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Haos',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: HaosDarkus.name })

        if (HaosDarkus.activationConditions) {
            const checker = HaosDarkus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Haos', attributWeak: 'Darkus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Haos')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Darkus')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const DarkusAquos: abilityCardsType = {
    key: 'combination-darkus-aquos',
    name: 'Correlation : Darkus - Aquos',
    description: `If a Darkus Bakugan bettles a Aquos Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Darkus',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: DarkusAquos.name })

        if (DarkusAquos.activationConditions) {
            const checker = DarkusAquos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Darkus', attributWeak: 'Aquos', bakuganKey: bakuganKey, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Darkus')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Aquos')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const AquosVentus: abilityCardsType = {
    key: 'combination-aquos-ventus',
    name: 'Correlation : Aquos - Ventus',
    description: `If a Aquos Bakugan bettles a Ventus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: AquosVentus.name })

        if (AquosVentus.activationConditions) {
            const checker = AquosVentus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Aquos', attributWeak: 'Ventus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Aquos')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Ventus')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const VentusPyrus: abilityCardsType = {
    key: 'combination-ventus-pyrus',
    name: 'Correlation : Ventus - Pyrus',
    description: `If a Ventus Bakugan bettles a Pyrus Bakugan, this card increases its power by 100 Gs`,
    attribut: 'Pyrus',
    maxInDeck: 1,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const failed = AbilityCardFailed({ card: VentusPyrus.name })

        if (VentusPyrus.activationConditions) {
            const checker = VentusPyrus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!roomState) return failed
        if (!slotOfGate) return failed
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Ventus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && bakugan.attribut === 'Ventus')
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && bakugan.attribut === 'Pyrus')

        if (!battleInProcess || paused) return false
        if (usersBakugans.length === 0 || opponentsbakugans.length === 0) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}