import { resolveReplayEnabledFlag } from "@bakugan-arena/game-data"

/**
 * Système de replay : désactivé tant que `NEXT_PUBLIC_REPLAY_ENABLED` n'est pas
 * explicitement à `true`. La variable doit être lue en littéral pour que Next.js
 * puisse l'inliner côté client.
 */
export const REPLAY_ENABLED = resolveReplayEnabledFlag(process.env.NEXT_PUBLIC_REPLAY_ENABLED)
