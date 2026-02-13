import { AbilityCardFailed, CombinationTripleEffect } from "../../function/index.js";
import type { abilityCardsType, attribut } from "../../type/type-index.js";

export const PyrusAquosHaos: abilityCardsType = {
    key: 'tripple-combination-pyrus-aquos-haos',
    name: 'Triple Correlation : Pyrus - Aquos - Haos',
    description: `If during the battle a player plays a combination of Fire (Pyrus), Water (Aquos) and Light (Haos), this card increases the G-Power of each of their Bakugans by 200 Gs`,
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

        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Pyrus', attribut_two: 'Aquos', attribut_tree: 'Haos', portalSlots: portalSlots, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Pyrus', 'Aquos', 'Haos']
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && attributs.includes(bakugan.attribut))

        if ((!battleInProcess || (battleInProcess && paused)) && usersBakugans.length < 3) return false

        return true
    }
}

export const VentusSubterraDarkus: abilityCardsType = {
    key: 'tripple-combination-ventus-subterra-darkus',
    name: 'Triple Correlation : Ventus - Subterra - Darkus',
    description: `If during the battle a player plays a combination of Wind (Ventus), Earth (Subterra) and Darkness (Darkus), this card increases the G-Power of each of their Bakugans by 200 Gs`,
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
        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Ventus', attribut_two: 'Subterra', attribut_tree: 'Darkus', portalSlots: portalSlots, userId: userId })
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot, turns } = roomState.battleState
        const attributs: attribut[] = ['Darkus', 'Ventus', 'Subterra']
        const usersBakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId && attributs.includes(bakugan.attribut))

        if ((!battleInProcess || (battleInProcess && paused)) && usersBakugans.length < 3) return false

        return true
    }
}