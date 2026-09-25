/**
 * Gameboard feature flags, read from Vite env vars at build time.
 *
 * The two halves of the V4 design are independent, so either can be rolled back
 * on its own if it costs too much in prod:
 *
 * - `VITE_ENABLE_V4_GALAXY_BACKGROUND`: drifting galaxies on black (and the
 *   camera limits that keep them behind the board) instead of the tiled floor.
 * - `VITE_ENABLE_V4_GAMEBOARD_HUD`: player pictures, timers, turn counter and
 *   KO markers rendered in the scene instead of the HTML overlay.
 * - `VITE_ENABLE_V4_STARFIELD`: star shell filling the sky around the board.
 * - `VITE_ENABLE_V4_BOARD_ANCHOR`: soft glow under the board.
 *
 * Both are ON by default: set one to "false" (or "0" / "off") to fall back to
 * the previous design without touching the code.
 */
function readBooleanFlag(value: string | boolean | undefined, fallback: boolean): boolean {
    if (value === undefined || value === "") return fallback
    if (typeof value === "boolean") return value

    const normalized = value.trim().toLowerCase()
    if (normalized === "false" || normalized === "0" || normalized === "off") return false
    if (normalized === "true" || normalized === "1" || normalized === "on") return true
    return fallback
}

export const ENABLE_V4_GALAXY_BACKGROUND = readBooleanFlag(
    import.meta.env.VITE_ENABLE_V4_GALAXY_BACKGROUND,
    true,
)

export const ENABLE_V4_GAMEBOARD_HUD = readBooleanFlag(
    import.meta.env.VITE_ENABLE_V4_GAMEBOARD_HUD,
    true,
)

export const ENABLE_V4_STARFIELD = readBooleanFlag(
    import.meta.env.VITE_ENABLE_V4_STARFIELD,
    true,
)

export const ENABLE_V4_BOARD_ANCHOR = readBooleanFlag(
    import.meta.env.VITE_ENABLE_V4_BOARD_ANCHOR,
    true,
)
