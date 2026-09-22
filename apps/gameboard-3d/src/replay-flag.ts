import { resolveReplayEnabledFlag } from '@bakugan-arena/game-data'

/**
 * Système de replay : désactivé tant que `VITE_REPLAY_ENABLED` n'est pas
 * explicitement à `true`. Vite inline la variable au build.
 */
export const REPLAY_ENABLED = resolveReplayEnabledFlag(import.meta.env.VITE_REPLAY_ENABLED)
