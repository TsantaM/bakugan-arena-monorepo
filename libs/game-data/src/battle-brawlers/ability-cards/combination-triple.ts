import { AbilityCardFailed, CombinationTripleEffect } from "../../function/index.js";
import type { abilityCardsType, attribut } from "../../type/type-index.js";

export const PyrusAquosHaos: abilityCardsType = {
    key: 'tripple-combination-pyrus-aquos-haos',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const failed = AbilityCardFailed({ abilityKey: PyrusAquosHaos.key })

        if (PyrusAquosHaos.activationConditions) {
            const checker = PyrusAquosHaos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return failed

        CombinationTripleEffect({ roomState: roomState, animations: roomState.animations, attribut_one: 'Pyrus', attribut_two: 'Aquos', attribut_tree: 'Haos', portalSlots: portalSlots, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState

        const requiredAttributs: attribut[] = ['Pyrus', 'Aquos', 'Haos']

        const usersBakugans = roomState.protalSlots
            .map((slot) => slot.bakugans)
            .flat()
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = requiredAttributs.every(attr =>
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

export const VentusSubterraDarkus: abilityCardsType = {
    key: 'tripple-combination-ventus-subterra-darkus',
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const failed = AbilityCardFailed({ abilityKey: VentusSubterraDarkus.key })

        if (VentusSubterraDarkus.activationConditions) {
            const checker = VentusSubterraDarkus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return failed
        CombinationTripleEffect({ roomState: roomState, animations: roomState.animations, attribut_one: 'Ventus', attribut_two: 'Subterra', attribut_tree: 'Darkus', portalSlots: portalSlots, userId: userId, turn: roomState.turnState.turnCount })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState

        const requiredAttributs: attribut[] = ['Ventus', 'Darkus', 'Subterra']

        const usersBakugans = roomState.protalSlots
            .map((slot) => slot.bakugans)
            .flat()
            .filter((bakugan) => bakugan.userId === userId)

        // On vérifie la présence de chaque attribut obligatoire
        const hasAllAttributs = requiredAttributs.every(attr =>
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