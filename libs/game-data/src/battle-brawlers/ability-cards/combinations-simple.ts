import { AbilityCardFailed, CombinationSimpleFunction } from "../../function/index.js";
import { type abilityCardsType } from "../../type/type-index.js";

export const SubterraPyrus: abilityCardsType = {
    key: 'combination-subterra-pyrus',
    name: 'Correlation : Subterra - Pyrus',
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Pyrus Bakugan if an opponent Subterra Bakugan shares that slot. Requires at least one Pyrus Bakugan you control and one opponent Subterra Bakugan on the field.`,
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

        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Pyrus', attributWeak: 'Subterra', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null

    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Pyrus' || bakugan.secondAttribut === 'Pyrus'))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Subterra' || bakugan.secondAttribut === 'Subterra'))

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
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Subterra Bakugan if an opponent Haos Bakugan shares that slot. Requires at least one Subterra Bakugan you control and one opponent Haos Bakugan on the field.`,
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
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Subterra', attributWeak: 'Haos', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Subterra' || bakugan.secondAttribut === 'Subterra'))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Haos' || bakugan.secondAttribut === 'Haos'))

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
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Haos Bakugan if an opponent Darkus Bakugan shares that slot. Requires at least one Haos Bakugan you control and one opponent Darkus Bakugan on the field.`,
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
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Haos', attributWeak: 'Darkus', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Haos' || bakugan.secondAttribut === 'Haos'))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Darkus' || bakugan.secondAttribut === 'Darkus'))

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
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Darkus Bakugan if an opponent Aquos Bakugan shares that slot. Requires at least one Darkus Bakugan you control and one opponent Aquos Bakugan on the field.`,
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
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Darkus', attributWeak: 'Aquos', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Darkus' || bakugan.secondAttribut === 'Darkus'))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Aquos' || bakugan.secondAttribut === "Aquos"))

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
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Aquos Bakugan if an opponent Ventus Bakugan shares that slot. Requires at least one Aquos Bakugan you control and one opponent Ventus Bakugan on the field.`,
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
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Aquos', attributWeak: 'Ventus', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Aquos' || bakugan.secondAttribut === "Aquos"))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Ventus' || bakugan.secondAttribut === 'Ventus'))

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
    description: `During battle on the battle slot, this card adds 100 Gs to your activating Ventus Bakugan if an opponent Pyrus Bakugan shares that slot. Requires at least one Ventus Bakugan you control and one opponent Pyrus Bakugan on the field.`,
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
        CombinationSimpleFunction({ animations: roomState?.animations, slotOfGate: slotOfGate, attribut: 'Ventus', attributWeak: 'Pyrus', bakuganKey: bakuganKey, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && (bakugan.attribut === 'Ventus' || bakugan.secondAttribut === 'Ventus'))
        const opponentsbakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId !== userId && (bakugan.attribut === 'Pyrus' || bakugan.secondAttribut === 'Pyrus'))

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