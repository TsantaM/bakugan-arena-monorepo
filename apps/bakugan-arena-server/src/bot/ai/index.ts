export { cloneRoomState } from "./clone-room-state"
export { simulateAction } from "./simulate-action"
export { applyTurnAdvance } from "./apply/apply-turn-advance"
export { applyAbilityAdditional } from "./apply/apply-ability-additional"
export { applyGateAdditional } from "./apply/apply-gate-additional"
export {
  scoreAction,
  applyPersonalityMultiplier,
  isActiveBattle,
  isNeutralSituation,
  battleJustStarted,
  battleStartsNowOrNextTurn,
  getBattlePowerTotals,
} from "./score-action"
export type { ScoreActionParams } from "./score-action"
export {
  getScoreWeights,
  getBaseScoreWeights,
  runWithScoreWeights,
  refreshScoreWeightsFromDb,
  startScoreWeightsPolling,
} from "./score-weights-runtime"
export {
  evaluateLegalMoves,
  evaluateLegalMovesDetailed,
  pickBestMove,
  pickMoveSoftmax,
} from "./evaluate-legal-moves"
export type { ScoredMove, EvaluateLegalMovesResult } from "./evaluate-legal-moves"
export {
  buildMatchAdaptation,
  applyMatchAdaptation,
  updateMatchMemory,
  clearMatchMemory,
  getMatchMemory,
  mergePersonalities,
} from "./match-adaptation"
export type { MatchAdaptation, MatchMemory, MatchPressure } from "./match-adaptation"
export type {
  SimulateAction,
  SimulateActionOptions,
  SimulateActionResult,
} from "./types"
