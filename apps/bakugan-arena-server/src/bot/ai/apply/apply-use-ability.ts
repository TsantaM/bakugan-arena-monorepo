import {
  AbilityCardsList,
  ExclusiveAbilitiesList,
  type activateAbilities,
  type slots_id,
  type stateType,
} from "@bakugan-arena/game-data"

type ApplyUseAbilityParams = {
  state: stateType
  userId: string
  abilityId: string
  bakuganKey: string
  slot: slots_id
}

/**
 * Active une aptitude sur une copie d'état (équivalent logique partiel de useAbilityCardServer, sans IO).
 */
export function applyUseAbility({
  state,
  userId,
  abilityId,
  bakuganKey,
  slot,
}: ApplyUseAbilityParams): { ok: true } | { ok: false; reason: string } {
  const abilities = [...AbilityCardsList, ...ExclusiveAbilitiesList]
  const abilityToUse = abilities.find((a) => a.key === abilityId)
  const playerAbilities = state.players.find((p) => p.userId === userId)?.usable_abilitys
  const slotObj = state.protalSlots.find((s) => s.id === slot)
  const abilityUser = slotObj?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

  if (!abilityToUse || !playerAbilities || playerAbilities <= 0 || !abilityUser || abilityUser.abilityBlock) {
    return { ok: false, reason: "cannot_use_ability" }
  }

  if (!state.turnState.use_ability_card) {
    return { ok: false, reason: "ability_not_allowed_this_turn" }
  }

  if (state.turnState.ability_card_block.blocked) {
    return { ok: false, reason: "ability_blocked" }
  }

  const abilityReturn = abilityToUse.onActivate({
    roomState: state,
    roomId: state.roomId,
    bakuganKey,
    slot,
    userId,
  })

  if (slotObj) {
    const lastId =
      slotObj.activateAbilities.length > 0
        ? slotObj.activateAbilities[slotObj.activateAbilities.length - 1].id
        : 0

    const newAbilityToPush: activateAbilities = {
      id: lastId + 1,
      bakuganKey,
      canceled: false,
      key: abilityId,
      userId,
    }
    slotObj.activateAbilities.push(newAbilityToPush)
  }

  const deck = state.decksState.find((d) => d.userId === userId)
  if (deck) {
    const abilityCard = deck.abilities.find((a) => a.key === abilityId && !a.used)
    if (abilityCard) abilityCard.used = true

    deck.bakugans.forEach((b) => {
      b.excluAbilitiesState.forEach((ex) => {
        if (ex.key === abilityId && !ex.used) ex.used = true
      })
    })
  }

  state.players = state.players.map((p) =>
    p.userId === userId ? { ...p, usable_abilitys: Math.max(0, p.usable_abilitys - 1) } : p
  )

  if (abilityReturn !== null && abilityReturn.type !== "CARD_FAILED") {
    state.AbilityAditionalRequest.push({
      roomId: state.roomId,
      cardKey: abilityId,
      bakuganKey,
      slot,
      userId,
      data: abilityReturn,
    })
  }

  return { ok: true }
}
