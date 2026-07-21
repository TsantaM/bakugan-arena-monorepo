import type {
  attribut,
  bakuganOnSlot,
  resolutionDataType,
  resolutionGateCardDataType,
  slots_id,
  stateType,
  AbilityCardsActionsRequestsType,
  gateCardActionRequestsType,
} from "@bakugan-arena/game-data"

/** Actions simulables — alignées sur ce que renvoient les clients / le bot */
export type SimulateAction =
  | {
      type: "SET_GATE"
      userId: string
      gateId: string
      /** Tour 0 : peut être omis (slot-2 / slot-5 auto) */
      slot?: slots_id | null
    }
  | {
      type: "SET_BAKUGAN"
      userId: string
      bakuganKey: string
      slot: slots_id
    }
  | {
      type: "USE_ABILITY"
      userId: string
      abilityId: string
      bakuganKey: string
      slot: slots_id
    }
  | {
      type: "ACTIVE_GATE"
      userId: string
      gateId: string
      slot: slots_id
    }
  | {
      type: "CHANGE_ATTRIBUTE"
      userId: string
      bakugan: bakuganOnSlot
      attribut: attribut
    }
  | {
      type: "TURN_SKIP"
      userId: string
    }
  | {
      type: "ABILITY_ADDITIONAL"
      userId: string
      cardKey: string
      bakuganKey: string
      data: resolutionDataType
    }
  | {
      type: "GATE_ADDITIONAL"
      userId: string
      cardKey: string
      data: resolutionGateCardDataType
    }

export type SimulateActionOptions = {
  /**
   * Si true, enchaîne le pipeline de fin de tour après l'action
   * (équivalent partiel de turnActionUpdater, sans IO).
   * Ignoré pour TURN_SKIP (toujours appliqué).
   */
  advanceTurn?: boolean
}

export type SimulateActionResult = {
  /** Nouvel état (copie) après simulation */
  state: stateType
  /** true si l'action n'a pas pu être appliquée (conditions non remplies) */
  rejected: boolean
  reason?: string
  /** Additional ability request encore en attente après l'action */
  pendingAbilityRequest?: AbilityCardsActionsRequestsType
  /** Additional gate request encore en attente après l'action */
  pendingGateRequest?: gateCardActionRequestsType
}
