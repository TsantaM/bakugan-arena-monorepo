import {
  AbilityCardsList,
  ExclusiveAbilitiesList,
  GateCardsList,
  BakuganList,
  Slots,
  addBakuganToSlot,
  type activateAbilities,
  type slots_id,
  type stateType,
} from "@bakugan-arena/game-data"

type ApplySetBakuganParams = {
  state: stateType
  userId: string
  bakuganKey: string
  slot: slots_id
}

/**
 * Pose un bakugan sur une copie d'état (équivalent logique de SetBakuganOnGate).
 */
export function applySetBakugan({
  state,
  userId,
  bakuganKey,
  slot,
}: ApplySetBakuganParams): { ok: true } | { ok: false; reason: string } {
  const usableBakugan =
    state.decksState
      .find((d) => d.userId === userId)
      ?.bakugans.filter(
        (b) => b?.bakuganData.onDomain === false && b?.bakuganData.elimined === false
      ).length ?? 0

  const usersBakuganOnGate =
    state.protalSlots.find((s) => s.id === slot)?.bakugans.filter((b) => b.userId === userId)
      .length ?? 0

  const slotToUpdate = state.protalSlots.find((s) => s.id === slot)
  if (!slotToUpdate) return { ok: false, reason: "slot_not_found" }

  const isSlotUsable = slotToUpdate.portalCard != null
  const canPlayerSetBakugan = state.turnState.set_new_bakugan
  const isNotPreviousTurn = state.turnState.previous_turn !== userId
  const hasNoBakuganOnSlot = usersBakuganOnGate < 1

  if (!isSlotUsable || !canPlayerSetBakugan || !isNotPreviousTurn || !hasNoBakuganOnSlot) {
    return { ok: false, reason: "cannot_place_bakugan" }
  }

  const deckToUpdate = state.decksState.find((s) => s.userId === userId)
  const bakuganFromDeck = deckToUpdate?.bakugans.find(
    (b) => b?.bakuganData.key === bakuganKey
  )?.bakuganData
  const bakuganToAdd = BakuganList.find((b) => b.key === bakuganKey)

  if (!bakuganFromDeck || !bakuganToAdd) {
    return { ok: false, reason: "bakugan_not_found" }
  }

  const opponentsBakugans = state.decksState.find((d) => d.userId !== userId)?.bakugans
  const opponentsUsableBakugans =
    opponentsBakugans?.filter(
      (b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false
    ).length ?? 0

  const slotHasOpponentBakugan = slotToUpdate.bakugans.some((b) => b.userId !== userId)
  const slotHasUserBakugan = slotToUpdate.bakugans.some((b) => b.userId === userId)
  const isLastBakugan = usableBakugan === 1
  const opponentHasUsableBakugan = opponentsUsableBakugans > 0

  const canPlace =
    !isLastBakugan ||
    (isLastBakugan &&
      (!opponentHasUsableBakugan
        ? slotHasOpponentBakugan && !slotHasUserBakugan
        : opponentHasUsableBakugan))

  if (!canPlace) return { ok: false, reason: "last_bakugan_placement_invalid" }

  const updated = addBakuganToSlot({
    bakuganFromDeck,
    bakuganToAdd,
    roomData: state,
    slotId: slot,
    userId,
  })

  state.protalSlots = updated.protalSlots
  state.decksState = updated.decksState

  const updatedSlot = state.protalSlots[Slots.indexOf(slot)]
  const bakugan = updatedSlot?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
  if (!bakugan || !updatedSlot) return { ok: false, reason: "bakugan_not_on_slot_after_set" }

  const persistantAbilities = state.persistantAbilities.filter(
    (a) => a.bakuganKey === bakuganKey && a.userId === userId && !a.canceled
  )

  persistantAbilities.forEach((ability) => {
    const card = [...AbilityCardsList, ...ExclusiveAbilitiesList].find((c) => c.key === ability.key)
    if (!card) return

    const abilities = updatedSlot.activateAbilities
    const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
    const newAbility: activateAbilities = {
      bakuganKey,
      canceled: false,
      id: lastId + 1,
      key: ability.key,
      userId,
    }
    updatedSlot.activateAbilities.push(newAbility)

    if (card.onUserSet) {
      card.onUserSet({
        bakuganKey,
        roomState: state,
        userId,
        slot,
      })
    }
  })

  if (updatedSlot.portalCard !== null) {
    const gateCard = GateCardsList.find((card) => card.key === updatedSlot.portalCard!.key)
    if (gateCard?.onSetBakuganOnSlot) {
      gateCard.onSetBakuganOnSlot({
        bakugan,
        roomState: state,
        slot: updatedSlot,
      })
    }
  }

  return { ok: true }
}
