import type {
  AbilityCardsActionsRequestsType,
  ActionType,
  gateCardActionRequestsType,
  resolutionDataType,
  resolutionGateCardDataType,
} from "@bakugan-arena/game-data"
import type { SimulateAction } from "./types"

export const expandTurnAction = (action: ActionType, userId: string): SimulateAction[] => {
  switch (action.type) {
    case "SELECT_GATE_CARD":
      return action.data.map((card) => ({
        type: "SET_GATE" as const,
        userId,
        gateId: card.key,
        slot: null,
      }))

    case "SET_GATE_CARD_ACTION": {
      const moves: SimulateAction[] = []
      for (const card of action.data.cards) {
        for (const slot of action.data.slots) {
          moves.push({
            type: "SET_GATE",
            userId,
            gateId: card.key,
            slot,
          })
        }
      }
      return moves
    }

    case "SET_BAKUGAN": {
      const moves: SimulateAction[] = []
      for (const bakugan of action.data.bakugans) {
        for (const slot of action.data.setableSlots) {
          moves.push({
            type: "SET_BAKUGAN",
            userId,
            bakuganKey: bakugan.key,
            slot,
          })
        }
      }
      return moves
    }

    case "SELECT_BAKUGAN":
      return action.data.map((bakugan) => ({
        type: "SET_BAKUGAN" as const,
        userId,
        bakuganKey: bakugan.key,
        slot: "slot-2" as const,
      }))

    case "USE_ABILITY_CARD": {
      const moves: SimulateAction[] = []
      for (const selection of action.data) {
        for (const ability of selection.abilities) {
          moves.push({
            type: "USE_ABILITY",
            userId,
            abilityId: ability.key,
            bakuganKey: selection.bakuganKey,
            slot: selection.slot,
          })
        }
      }
      return moves
    }

    case "OPEN_GATE_CARD":
      return [
        {
          type: "ACTIVE_GATE",
          userId,
          gateId: action.gateId,
          slot: action.slot,
        },
      ]

    case "ACTIVE_GATE_CARD": {
      const gateId = action.data.portalCard?.key
      if (!gateId) return []
      return [
        {
          type: "ACTIVE_GATE",
          userId,
          gateId,
          slot: action.data.id,
        },
      ]
    }

    case "CHANGE_ATTRIBUTE": {
      const moves: SimulateAction[] = []
      for (const entry of action.data) {
        for (const attribut of entry.attributs) {
          moves.push({
            type: "CHANGE_ATTRIBUTE",
            userId,
            bakugan: entry.target,
            attribut,
          })
        }
      }
      return moves
    }

    case "SELECT_ABILITY_CARD":
      return []

    default:
      return []
  }
}

export const expandAbilityAdditional = (
  request: AbilityCardsActionsRequestsType
): SimulateAction[] => {
  const { userId, cardKey, bakuganKey, data } = request
  const base = { type: "ABILITY_ADDITIONAL" as const, userId, cardKey, bakuganKey }

  switch (data.type) {
    case "SELECT_SLOT":
      return data.slots.map((slot) => ({
        ...base,
        data: { type: "SELECT_SLOT" as const, slot },
      }))

    case "SELECT_BAKUGAN_TO_SET":
      return data.bakugans.map((bakugan) => ({
        ...base,
        data: { type: "SELECT_BAKUGAN_TO_SET" as const, bakugan },
      }))

    case "MOVE_BAKUGAN_TO_ANOTHER_SLOT": {
      const moves: SimulateAction[] = []
      for (const bakugan of data.bakugans) {
        for (const slot of data.slots) {
          moves.push({
            ...base,
            data: { type: "MOVE_BAKUGAN_TO_ANOTHER_SLOT", bakugan, slot },
          })
        }
      }
      return moves
    }

    case "SELECT_BAKUGAN_ON_DOMAIN":
      return data.bakugans.map((target) => ({
        ...base,
        data: {
          type: "SELECT_BAKUGAN_ON_DOMAIN" as const,
          bakugan: target.key,
          slot: target.slot,
          userId: target.userId,
        } satisfies resolutionDataType,
      }))

    case "ATTRACT_BAKUGAN":
      return data.bakugans.map((bakugan) => ({
        ...base,
        data: { type: "ATTRACT_BAKUGAN" as const, bakugan },
      }))

    case "SELECT_ABILITY_CARD":
      return data.data.map((card) => ({
        ...base,
        data: {
          type: "SELECT_ABILITY_CARD" as const,
          cardOwnerId: data.target ? data.target : userId,
          card,
        },
      }))

    case "CARD_FAILED":
      return [
        {
          ...base,
          data: { type: "SKIP_ACTION" },
        },
      ]

    default:
      return [
        {
          ...base,
          data: { type: "SKIP_ACTION" },
        },
      ]
  }
}

export const expandGateAdditional = (
  request: gateCardActionRequestsType
): SimulateAction[] => {
  const { userId, cardKey, data } = request
  const base = { type: "GATE_ADDITIONAL" as const, userId, cardKey }

  if (data.type === "SELECT_ABILITY_CARD") {
    return data.data.map((card) => ({
      ...base,
      data: {
        type: "SELECT_ABILITY_CARD" as const,
        cardOwnerId: data.target ? data.target : userId,
        card,
      } satisfies resolutionGateCardDataType,
    }))
  }

  if (data.type === "SELECT_BAKUGAN_TO_SET") {
    return data.bakugans.map((bakugan) => ({
      ...base,
      data: { type: "SELECT_BAKUGAN_TO_SET" as const, bakugan },
    }))
  }

  return [
    {
      ...base,
      data: { type: "SKIP_ACTION" },
    },
  ]
}

export const isAdditionalRequestForUser = (
  request: { userId: string; data: { target?: string } },
  userId: string
): boolean => {
  return (!request.data.target && request.userId === userId) || request.data.target === userId
}
