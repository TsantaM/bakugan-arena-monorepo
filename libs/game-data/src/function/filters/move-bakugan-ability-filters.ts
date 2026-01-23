import { bakuganToMoveType, type portalSlotsType, type slots_id } from '../../type/type-index.js'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards.js'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities.js'
import { slots_limits } from '../../store/store-index.js'

export function MoveBakuganAbilityFilters({ slots, bakuganToMove, userId, bakuganKey, zone, ability }: { slots: portalSlotsType | undefined, bakuganToMove: bakuganToMoveType | undefined, userId: string, bakuganKey: string, zone: slots_id | '', ability: string }) {

    if (!slots) return
    if (!bakuganToMove) return

    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id ? slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id : zone !== '' ? zone : undefined


    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    const exclusiveAbilityData = ExclusiveAbilitiesList.find((a) => a.key === ability)
    const limits = slots_limits.find((s) => s.slot === abilityUserSlots)?.slot_limit


    if (abilityData && !exclusiveAbilityData && abilityData.slotLimits) {

        const bakuganToMoveList: bakuganToMoveType[] | undefined = slots.filter((s) => s.portalCard !== null && !s.can_set && s.bakugans.length > 0 && limits?.includes(s.id)).flatMap((slot) =>
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

    } else if (!abilityData && exclusiveAbilityData && exclusiveAbilityData.slotLimits) {

        const bakuganToMoveList: bakuganToMoveType[] | undefined = slots.filter((s) => s.portalCard !== null && !s.can_set && s.bakugans.length > 0 && limits?.includes(s.id)).flatMap((slot) =>
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

    } else {
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

}