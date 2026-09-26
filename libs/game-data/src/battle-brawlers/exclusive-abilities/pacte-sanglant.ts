import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, isInActiveBattle } from "./helpers.js"

/** Puissance offerte par le pacte. */
const PACT_POWER = 200

/**
 * Pacte Sanglant — Aquos Diablo.
 *
 * Diablo signe : +200 Gs immediatement, mais il est banni du jeu s'il perd ce
 * combat — aucune carte de reanimation (Renaissance, Engourdissement, Fleche du
 * Sagittaire) ne pourra le ramener.
 *
 * Le statut `banished` est pose tout de suite : si Diablo gagne, `onWin` le
 * leve. Poser le risque des l'activation garantit que la sanction s'applique
 * meme si le bakugan est elimine en cours de combat.
 */
export const PacteSanglant: exclusiveAbilitiesType = {
    key: 'pacte-sanglant',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        caster.user.statut.banished = {
            check: true,
            origin: 'ABILITY',
            key: PacteSanglant.key,
        }

        const deckData = roomState.decksState
            .find((d) => d.userId === userId)
            ?.bakugans.find((b) => b?.bakuganData.key === caster.user.key)

        if (deckData) deckData.bakuganData.banished = true

        CustomAnimationDirective({
            roomState,
            animationKey: PacteSanglant.key,
            sourceBakugan: caster.user,
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_banished_pact',
            params: { name: Bakugans[caster.user.key].name },
        })

        PowerChange({ roomState, bakugan: caster.user, G: PACT_POWER, malus: false })

        return null
    },
    onWin({ roomState, userId, slot }) {
        if (!roomState) return

        // Pacte honore : le bannissement est leve sur le vainqueur.
        slot.bakugans
            .filter((b) => b.userId === userId && b.statut.banished)
            .forEach((bakugan) => {
                const status = bakugan.statut.banished
                if (!status || status.key !== PacteSanglant.key) return

                bakugan.statut.banished = false

                const deckData = roomState.decksState
                    .find((d) => d.userId === userId)
                    ?.bakugans.find((b) => b?.bakuganData.key === bakugan.key)

                if (deckData) deckData.bakuganData.banished = false

                NewAdditionnalMessage({
                    roomState,
                    key: 'bakugan_pact_honored',
                    params: { name: Bakugans[bakugan.key].name },
                })
            })
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const status = caster.user.statut.banished
        if (status && status.key === PacteSanglant.key) {
            caster.user.statut.banished = false

            const deckData = roomState.decksState
                .find((d) => d.userId === userId)
                ?.bakugans.find((b) => b?.bakuganData.key === caster.user.key)

            if (deckData) deckData.bakuganData.banished = false
        }

        PowerChange({
            roomState,
            bakugan: caster.user,
            G: PACT_POWER,
            malus: true,
            ignoreProtection: true,
        })
    },
    canUse({ roomState, bakugan }) {
        // Un pari ne se prend qu'au combat, et une seule fois.
        if (bakugan.statut.banished) return false
        return isInActiveBattle(roomState, bakugan)
    },
}
