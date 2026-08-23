import type { stateType } from "@bakugan-arena/game-data"

/**
 * Clone profond d'un état de room pour simulation IA.
 * Ne partage aucune référence mutable avec l'état réel
 * (sauf contenu non sérialisable volontairement réinitialisé).
 */
export function cloneRoomState(state: stateType): stateType {
  const {
    gameLog: _gameLog,
    animationsForReplay: _animationsForReplay,
    initialReplaySnapshot: _initialReplaySnapshot,
    ...stateWithoutReplayBuffer
  } = state
  const cloned = structuredClone({
    ...stateWithoutReplayBuffer,
    connectedsUsers: Object.fromEntries(state.connectedsUsers),
    spectators: Object.fromEntries(state.spectators),
  }) as unknown as stateType

  cloned.connectedsUsers = new Map()
  cloned.spectators = new Map()
  cloned.animations = []
  cloned.animationsForReplay = []
  cloned.initialReplaySnapshot = state.initialReplaySnapshot

  return cloned
}
