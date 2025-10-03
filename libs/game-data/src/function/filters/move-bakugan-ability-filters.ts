import { portalSlotsType } from '../../type/room-types'
import { bakuganToMoveType } from '../../type/game-data-types'

export function MoveBakuganAbilityFilters({ slots, bakuganToMove }: { slots: portalSlotsType | undefined, bakuganToMove: bakuganToMoveType | undefined }) {

    if(!slots) return
    if(!bakuganToMove) return

    const bakuganToMoveList: bakuganToMoveType[] | undefined = slots.filter((s) => s.portalCard !== null && !s.can_set && s.bakugans.length > 0).flatMap((slot) =>
        slot.bakugans.map((bakugan) => ({
            slot: slot.id,
            bakuganKey: bakugan.key,
            userId: bakugan.userId
        }))
    )
    const bakuganToMoveDestinations = slots.filter((s) => s.id !== bakuganToMove?.slot && !s.can_set && s.portalCard !== null)

    return {
        bakuganToMoveList,
        bakuganToMoveDestinations
    }

}