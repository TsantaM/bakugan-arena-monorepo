import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { countEliminated, getCaster } from "./helpers.js"

/** Bonus de base. */
const BASE_POWER = 50
/** Bonus gagne par bakugan adverse deja elimine. */
const POWER_PER_KILL = 100

/**
 * Griffes Affamees — Fear Ripper.
 *
 * Chaque bakugan adverse deja tombe dans la partie nourrit Fear Ripper :
 * +50 Gs, puis +100 Gs par elimination adverse.
 *
 * Miroir de la Rage Sismique de Saurus : la rage recompense celui qui encaisse,
 * les griffes recompensent celui qui a deja frappe. Fear Ripper cesse d'etre un
 * simple 380 Gs et devient le finisher d'une partie qu'on est en train de gagner.
 */
export const GriffesAffamees: exclusiveAbilitiesType = {
    key: 'griffes-affamees',
    maxInDeck: 2,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        const opponentId = roomState.decksState.find((d) => d.userId !== userId)?.userId
        const kills = opponentId ? countEliminated(roomState, opponentId) : 0
        const power = BASE_POWER + kills * POWER_PER_KILL

        CustomAnimationDirective({
            roomState,
            animationKey: GriffesAffamees.key,
            sourceBakugan: caster.user,
            slotId: slot,
            payload: { power, kills },
        })

        PowerChange({ roomState, bakugan: caster.user, G: power, malus: false })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const opponentId = roomState.decksState.find((d) => d.userId !== userId)?.userId
        const kills = opponentId ? countEliminated(roomState, opponentId) : 0

        PowerChange({
            roomState,
            bakugan: caster.user,
            G: BASE_POWER + kills * POWER_PER_KILL,
            malus: true,
            ignoreProtection: true,
        })
    },
}
