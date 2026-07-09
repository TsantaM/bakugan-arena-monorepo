import { AbilityCardFailed, CombinationTripleEffect } from "../../function/index.js";
import type { abilityCardsType, attribut } from "../../type/type-index.js";

export const PyrusAquosHaos: abilityCardsType = {
    key: 'tripple-combination-pyrus-aquos-haos',
    name: 'Triple Correlation : Pyrus - Aquos - Haos',
    description: `During battle, this card adds 200 Gs to every Bakugan you control on the field if you have Pyrus, Aquos, and Haos Bakugan on the field. Can only be activated by a Bakugan whose attribute is Pyrus, Aquos, or Haos.`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const failed = AbilityCardFailed({ card: PyrusAquosHaos.name })

        if (PyrusAquosHaos.activationConditions) {
            const checker = PyrusAquosHaos.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return failed

        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Pyrus', attribut_two: 'Aquos', attribut_tree: 'Haos', portalSlots: portalSlots, userId: userId, turn: roomState.turnState.turnCount })
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

        const attributs = ['Pyrus', 'Aquos', 'Haos']

        if (
            !attributs.includes(bakugan.attribut) &&
            bakugan.secondAttribut &&
            !attributs.includes(bakugan.secondAttribut)
        ) {
            return false
        }

        return true
    }
}

export const VentusSubterraDarkus: abilityCardsType = {
    key: 'tripple-combination-ventus-subterra-darkus',
    name: 'Triple Correlation : Ventus - Subterra - Darkus',
    description: `During battle, this card adds 200 Gs to every Bakugan you control on the field if you have Ventus, Subterra, and Darkus Bakugan on the field. Can only be activated by a Bakugan whose attribute is Ventus, Subterra, or Darkus.`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const failed = AbilityCardFailed({ card: VentusSubterraDarkus.name })

        if (VentusSubterraDarkus.activationConditions) {
            const checker = VentusSubterraDarkus.activationConditions({ roomState, userId })
            if (checker === false) return failed
        }
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return failed
        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Ventus', attribut_two: 'Subterra', attribut_tree: 'Darkus', portalSlots: portalSlots, userId: userId, turn: roomState.turnState.turnCount })
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

        const attributs = ['Ventus', 'Subterra', 'Darkus']

        if (
            !attributs.includes(bakugan.attribut) &&
            bakugan.secondAttribut &&
            !attributs.includes(bakugan.secondAttribut)
        ) {
            return false
        }

        return true
    }

}