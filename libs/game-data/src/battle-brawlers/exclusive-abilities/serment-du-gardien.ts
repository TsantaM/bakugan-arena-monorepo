import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getAlliesOnSlot, getCaster } from "./helpers.js"

/**
 * Serment du Gardien — Haos Siege.
 *
 * Siege se porte garant de ses allies : tant que le statut tient, tout malus de
 * puissance destine a un allie present sur la meme carte portail est encaisse
 * par Siege a leur place (voir `PowerChange` / `findGuardianFor`).
 *
 * Elle rend les formations a plusieurs bakugans reellement jouables : on peut
 * proteger un finisher fragile en placant Siege a cote de lui.
 */
export const SermentDuGardien: exclusiveAbilitiesType = {
    key: 'serment-du-gardien',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Haos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        if (caster.user.statut.guardian) return null

        caster.user.statut.guardian = {
            check: true,
            origin: 'ABILITY',
            key: SermentDuGardien.key,
        }

        const allies = getAlliesOnSlot(caster.slotOfGate, caster.user)

        CustomAnimationDirective({
            roomState,
            animationKey: SermentDuGardien.key,
            sourceBakugan: caster.user,
            targetBakugans: allies,
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_guardian_active',
            params: { name: Bakugans[caster.user.key].name },
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const status = caster.user.statut.guardian
        if (!status || status.key !== SermentDuGardien.key) return

        caster.user.statut.guardian = false

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_guardian_ended',
            params: { name: Bakugans[caster.user.key].name },
        })
    },
    canUse({ roomState, bakugan }) {
        if (bakugan.statut.guardian) return false

        // Sans allie a proteger sur l'emplacement, le serment ne sert a rien.
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return getAlliesOnSlot(slot, bakugan).length > 0
    },
}
