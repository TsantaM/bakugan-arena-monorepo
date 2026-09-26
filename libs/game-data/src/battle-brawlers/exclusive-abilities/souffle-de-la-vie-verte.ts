import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganOnSlot } from "../../type/room-types.js"
import { getCaster } from "./helpers.js"

/**
 * Souffle de la Vie Verte — Ventus Oberus.
 *
 * Le Soldat Legendaire du vent rend leur souffle a ses allies : toutes les
 * capacites exclusives deja consommees par les bakugans allies encore en jeu
 * redeviennent utilisables une fois.
 *
 * C'est une carte d'economie de ressources : elle ne change aucune puissance,
 * elle rend du carburant. Annulee, les capacites regagnees sont reconsommees.
 */
export const SouffleDeLaVieVerte: exclusiveAbilitiesType = {
    key: 'souffle-de-la-vie-verte',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Ventus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return null

        // Seuls les bakugans encore en jeu profitent du souffle. On note
        // precisement ce qui a ete rendu, pour pouvoir le reprendre a l'identique
        // si la carte est annulee.
        const refreshed: string[] = []

        deck.bakugans.forEach((bakugan) => {
            if (!bakugan) return
            if (bakugan.bakuganData.elimined) return

            bakugan.excluAbilitiesState.forEach((ability) => {
                // La carte en cours d'activation n'est marquee `used` qu'apres
                // `onActivate` : on l'exclut explicitement pour qu'elle ne se
                // recharge pas elle-meme.
                if (ability.key === SouffleDeLaVieVerte.key) return
                if (ability.dead) return
                if (!ability.used) return

                ability.used = false
                refreshed.push(`${bakugan.bakuganData.key}::${ability.key}`)
            })
        })

        if (refreshed.length === 0) {
            NewAdditionnalMessage({
                roomState,
                key: 'no_ability_to_refresh',
                params: { abilityKey: SouffleDeLaVieVerte.key },
            })
            return null
        }

        // Trace de ce qui a ete rendu : relue par `onCanceled`.
        roomState.persistantAbilities.push({
            id: roomState.persistantAbilities.length + 1,
            key: SouffleDeLaVieVerte.key,
            bakuganKey,
            userId,
            canceled: false,
            fusion: refreshed,
        })

        const allies: bakuganOnSlot[] = roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.userId === userId)

        CustomAnimationDirective({
            roomState,
            animationKey: SouffleDeLaVieVerte.key,
            sourceBakugan: caster.user,
            targetBakugans: allies,
            slotId: slot,
            payload: { refreshed },
        })

        NewAdditionnalMessage({
            roomState,
            key: 'abilities_refreshed',
            params: { abilityKey: SouffleDeLaVieVerte.key, count: refreshed.length },
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey }) {
        if (!roomState) return

        const record = [...roomState.persistantAbilities]
            .reverse()
            .find(
                (a) =>
                    a.key === SouffleDeLaVieVerte.key &&
                    !a.canceled &&
                    a.userId === userId &&
                    a.bakuganKey === bakuganKey,
            )

        if (!record) return
        record.canceled = true

        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return

        // On ne reprend que les capacites effectivement rendues par ce souffle,
        // et seulement si elles n'ont pas deja reservi entre-temps.
        record.fusion?.forEach((entry) => {
            const [bakuganDeckKey, abilityKey] = entry.split('::')

            const ability = deck.bakugans
                .find((b) => b?.bakuganData.key === bakuganDeckKey)
                ?.excluAbilitiesState.find((a) => a.key === abilityKey)

            if (!ability) return
            ability.used = true
        })
    },
    activationConditions({ roomState, userId }) {
        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return false

        return deck.bakugans.some(
            (b) =>
                b &&
                !b.bakuganData.elimined &&
                b.excluAbilitiesState.some(
                    (a) => a.used && !a.dead && a.key !== SouffleDeLaVieVerte.key,
                ),
        )
    },
}
