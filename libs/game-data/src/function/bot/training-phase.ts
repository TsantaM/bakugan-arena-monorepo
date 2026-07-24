/** Phases utilisées pour des poids d'entraînement contextualisés. */
export type BotTrainingPhase = "neutral" | "battle_early" | "battle_late"

export const PHASE_WEIGHT_PREFIX = "ph:" as const
export const PREF_WEIGHT_PREFIX = "pref:" as const

export function resolveBotTrainingPhase(
  battleInProcess: boolean,
  battleTurns: number
): BotTrainingPhase {
  if (!battleInProcess) return "neutral"
  return battleTurns <= 0 ? "battle_early" : "battle_late"
}

export function phaseWeightKey(phase: BotTrainingPhase, featureKey: string): string {
  return `${PHASE_WEIGHT_PREFIX}${phase}|${featureKey}`
}

export function prefWeightKey(phase: BotTrainingPhase, moveType: string): string {
  return `${PREF_WEIGHT_PREFIX}${phase}|${moveType}`
}

export function isPhaseWeightKey(key: string): boolean {
  return key.startsWith(PHASE_WEIGHT_PREFIX)
}

export function isPrefWeightKey(key: string): boolean {
  return key.startsWith(PREF_WEIGHT_PREFIX)
}

/** Mappe une action runtime vers le type d'animation utilisé à l'entraînement. */
export function simulateActionToPrefType(actionType: string): string | null {
  switch (actionType) {
    case "SET_GATE":
      return "SET_GATE_CARD"
    case "SET_BAKUGAN":
      return "SET_BAKUGAN"
    case "USE_ABILITY":
    case "ABILITY_ADDITIONAL":
      return "ACTIVE_ABILITY_CARD"
    case "ACTIVE_GATE":
    case "GATE_ADDITIONAL":
      return "OPEN_GATE_CARD"
    case "CHANGE_ATTRIBUTE":
      return "CHANGE_ATTRIBUT"
    default:
      return null
  }
}
