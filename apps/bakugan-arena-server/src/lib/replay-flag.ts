import "dotenv/config"
import { resolveReplayEnabledFlag, setReplayEnabled } from "@bakugan-arena/game-data"

/**
 * Système de replay : désactivé tant que `REPLAY_ENABLED` n'est pas explicitement
 * à `true`. Importer ce module configure le flag partagé de `@bakugan-arena/game-data`,
 * ce qui court-circuite l'enregistrement des snapshots dans le moteur de jeu.
 */
export const REPLAY_ENABLED = resolveReplayEnabledFlag(process.env.REPLAY_ENABLED)

setReplayEnabled(REPLAY_ENABLED)
