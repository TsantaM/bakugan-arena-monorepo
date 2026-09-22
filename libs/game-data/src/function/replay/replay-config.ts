/**
 * Interrupteur global du système de replay.
 *
 * Désactivé par défaut : chaque application (serveur, Next.js, gameboard-3d)
 * appelle `setReplayEnabled(...)` au démarrage à partir de sa propre variable
 * d'environnement. Tant que rien n'est configuré, aucun replay n'est enregistré.
 */

let replayEnabled = false

/** `"true" | "1" | "yes" | "on"` (insensible à la casse) → true, tout le reste → false. */
export function resolveReplayEnabledFlag(raw: unknown): boolean {
    if (typeof raw === "boolean") return raw
    if (typeof raw !== "string") return false

    const normalized = raw.trim().toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on"
}

export function setReplayEnabled(enabled: unknown): void {
    replayEnabled = resolveReplayEnabledFlag(enabled)
}

export function isReplayEnabled(): boolean {
    return replayEnabled
}
