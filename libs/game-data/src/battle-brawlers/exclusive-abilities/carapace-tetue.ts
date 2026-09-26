import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/**
 * Carapace Tetue — Subterra Saurus.
 *
 * Saurus se recroqueville : sa puissance est verrouillee. Il n'encaisse plus
 * aucun malus… mais ne profite plus non plus du moindre bonus, ni des siens ni
 * de ceux de ses allies ou de sa carte portail.
 *
 * C'est la reponse structurelle aux decks qui gagnent en accumulant des
 * retraits de puissance : on fige le combat sur la puissance actuelle.
 */
export const CarapaceTetue: exclusiveAbilitiesType = {
    key: 'carapace-tetue',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Subterra',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        if (caster.user.statut.powerLocked) {
            NewAdditionnalMessage({
                roomState,
                key: 'bakugan_power_locked',
                params: { name: Bakugans[caster.user.key].name },
            })
            return null
        }

        caster.user.statut.powerLocked = {
            check: true,
            origin: 'ABILITY',
            key: CarapaceTetue.key,
            value: caster.user.currentPower,
        }

        CustomAnimationDirective({
            roomState,
            animationKey: CarapaceTetue.key,
            sourceBakugan: caster.user,
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_power_locked',
            params: { name: Bakugans[caster.user.key].name },
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const status = caster.user.statut.powerLocked
        if (!status || status.key !== CarapaceTetue.key) return

        caster.user.statut.powerLocked = false

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_power_unlocked',
            params: { name: Bakugans[caster.user.key].name },
        })
    },
    canUse({ bakugan }) {
        return !bakugan.statut.powerLocked
    },
}
