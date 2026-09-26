import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnField } from "./helpers.js"

/** Puissance drainee a chaque bakugan adverse du terrain. */
const DRAIN_PER_OPPONENT = 50

/**
 * Ancre Abyssale — Aquos Warius.
 *
 * Warius jette son ancre au fond du domaine : chaque bakugan adverse present
 * sur le terrain lui cede 50 Gs. Plus l'adversaire occupe le terrain, plus le
 * drain est lourd.
 *
 * C'est la reponse aux strategies d'occupation massive (renforts, gate cards a
 * plusieurs bakugans), la ou les cartes classiques ne touchent qu'une cible.
 */
export const AncreAbyssale: exclusiveAbilitiesType = {
    key: 'ancre-abyssale',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: AncreAbyssale.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const opponents = getOpponentsOnField(roomState, userId)
        if (opponents.length === 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: AncreAbyssale.key,
            sourceBakugan: caster.user,
            targetBakugans: opponents,
            slotId: slot,
        })

        // Warius ne gagne que ce qu'il a reellement arrache : les cibles
        // protegees ou verrouillees ne cedent rien.
        let drained = 0

        opponents.forEach((opponent) => {
            const before = opponent.currentPower
            PowerChange({ roomState, bakugan: opponent, G: DRAIN_PER_OPPONENT, malus: true })
            drained += before - opponent.currentPower
        })

        if (drained > 0) {
            PowerChange({ roomState, bakugan: caster.user, G: drained, malus: false })
        }

        return null
    },
    activationConditions({ roomState, userId }) {
        return getOpponentsOnField(roomState, userId).length > 0
    },
    canUse({ roomState, bakugan }) {
        return getOpponentsOnField(roomState, bakugan.userId).length > 0
    },
}
