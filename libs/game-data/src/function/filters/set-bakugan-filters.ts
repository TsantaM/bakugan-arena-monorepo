import { type deckType, type portalSlotsType, type slots_id } from '../../type/room-types'

export function SetBakuganFilters({ playersDeck, opponentDeck, slots, slot, userId }: { playersDeck: deckType | undefined, opponentDeck: deckType | undefined, slots: portalSlotsType | undefined, slot: "" | slots_id,  userId: string }) {

    if(!playersDeck) return
    if(!opponentDeck) return

    const playersBakugans = playersDeck.bakugans
    const opponentsBakugans = opponentDeck.bakugans

    if (!playersBakugans) return
    if (!opponentsBakugans) return

    const usableBakugans = playersBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)
    const usableBakugansCount = usableBakugans?.length ?? 0

    const opponentsUsableBakugans = opponentsBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)

    if (!slots) return
    // Usable Slots
    const slotWithBakugan = slots.filter((s) => s.can_set === false && s.portalCard !== null && s.bakugans.length > 0)
    const slotWithGate = slots.filter((s) => s.portalCard !== null && !s.can_set)

    const oneBakuganLeft = usableBakugansCount === 1
    const opponentsOneBakuganLeft = opponentsUsableBakugans?.length ? opponentsUsableBakugans?.length <= 1 : false
    const noBakuganOnDomain = slotWithBakugan?.length === 0
    const noGateOnDomain = slotWithGate?.length === 0

    const oneLeftAndOpponentsOnDomain = oneBakuganLeft && !noBakuganOnDomain && !opponentsOneBakuganLeft
    const oneLeftAndOpponentsOnDomainAddNoGate = oneLeftAndOpponentsOnDomain && !noGateOnDomain

    const usableSlots =
        !oneLeftAndOpponentsOnDomain // ✅ ajout cas spécial
            ? slots?.
                filter((s) => s.portalCard !== null && s.can_set === false).
                filter((s) => !s.bakugans?.some((b) => b.userId === userId))

            : slots?.
                filter((s) => s.bakugans.some((b) => b.userId != userId)).
                filter((s) => s.bakugans.every((b) => b.userId != userId))

    const selectedSlot = !oneLeftAndOpponentsOnDomainAddNoGate || noGateOnDomain ? slots?.find((s) => s.id === slot) : undefined

    return {
        usableBakugans,
        usableBakugansCount,
        usableSlots,
        selectedSlot
    }
}