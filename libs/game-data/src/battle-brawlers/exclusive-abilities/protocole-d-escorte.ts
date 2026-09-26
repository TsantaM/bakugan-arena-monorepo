import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/**
 * Protocole d'Escorte — Robotallion.
 *
 * Robotallion se cale sur le plus puissant de ses allies : il adopte sa
 * puissance de base si elle est superieure a la sienne. Un Robotallion escorte
 * un Soldat Legendaire vaut donc 500 Gs de base.
 *
 * L'interet n'est pas le chiffre : c'est qu'un bakugan commun, disponible dans
 * les quatre attributs, devient un second mur credible dans les formations a
 * plusieurs bakugans — sans dependre de son propre niveau.
 */
export const ProtocoleDEscorte: exclusiveAbilitiesType = {
    key: "protocole-d-escorte",
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: ProtocoleDEscorte.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const allies = roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.userId === userId && b !== caster.user)

        if (allies.length === 0) return animation

        const reference = allies.reduce((best, b) => (b.powerLevel > best.powerLevel ? b : best))
        const gap = reference.powerLevel - caster.user.powerLevel

        if (gap <= 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: ProtocoleDEscorte.key,
            sourceBakugan: caster.user,
            targetBakugans: [reference],
            slotId: slot,
            payload: { gap },
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_escorting',
            params: { name: Bakugans[reference.key].name, power: gap },
        })

        PowerChange({ roomState, bakugan: caster.user, G: gap, malus: false })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const allies = roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.userId === userId && b !== caster.user)

        if (allies.length === 0) return

        const reference = allies.reduce((best, b) => (b.powerLevel > best.powerLevel ? b : best))
        const gap = reference.powerLevel - caster.user.powerLevel
        if (gap <= 0) return

        PowerChange({
            roomState,
            bakugan: caster.user,
            G: gap,
            malus: true,
            ignoreProtection: true,
        })
    },
    canUse({ roomState, bakugan }) {
        return roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .some((b) => b.userId === bakugan.userId && b !== bakugan && b.powerLevel > bakugan.powerLevel)
    },
}
