import { AbilityCards } from "../../battle-brawlers/ability-cards.js"
import { ExclusiveAbilities } from "../../battle-brawlers/exclusive-abilities.js"
import { GateCards } from "../../battle-brawlers/gate-gards.js"
import type { abilityCardsType, exclusiveAbilitiesType, gateCardType } from "../../type/game-data-types.js"
import type { bakuganOnSlot, onSlotStatutEffect, stateType } from "../../type/room-types.js"

type CardWithTargetDie = abilityCardsType | exclusiveAbilitiesType | gateCardType

function getCard(status: onSlotStatutEffect): CardWithTargetDie | undefined {
    if (status.origin === 'GATE') return GateCards[status.key]
    return ExclusiveAbilities[status.key] ?? AbilityCards[status.key]
}

/** Retrouve le bakugan à l'origine de l'effet sur le terrain (la référence stockée peut être obsolète). */
function findSource({ roomState, status }: { roomState: stateType, status: onSlotStatutEffect }): bakuganOnSlot | undefined {
    const user = status.ability?.user
    if (!user) return undefined

    return roomState.protalSlots
        .flatMap((s) => s.bakugans)
        .find((b) => b.key === user.key && b.userId === user.userId)
}

/**
 * Déclenche le hook `onTargetDie` de toutes les cartes ayant posé un statut sur ce bakugan.
 * À appeler juste après qu'un bakugan a été éliminé, quelle que soit la source de l'élimination.
 */
export function TriggerOnTargetDie({ roomState, bakugan }: { roomState: stateType, bakugan: bakuganOnSlot }) {
    if (!roomState) return
    if (!bakugan.statut) return

    const statuses = Object.values(bakugan.statut).filter(
        (status): status is onSlotStatutEffect => status !== false && status?.check === true
    )

    statuses.forEach((status) => {
        const card = getCard(status)
        if (!card || !card.onTargetDie) return

        card.onTargetDie({
            roomState,
            target: bakugan,
            status,
            source: findSource({ roomState, status })
        })
    })
}
