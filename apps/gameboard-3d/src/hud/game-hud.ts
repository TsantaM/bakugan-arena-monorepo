import type * as THREE from "three"
import { ENABLE_V4_GAMEBOARD_HUD } from "../config/feature-flags"
import { createPlayerHud, type HudSide, type PlayerHud } from "./player-hud"

let hud: PlayerHud | null = null

/**
 * Last known values. Entry points set the player pictures at module level,
 * before the renderer (and the HUD) exists — the state is replayed on init so
 * nothing is lost, whatever the call order.
 */
const state = {
    profile: { left: undefined as string | null | undefined, right: undefined as string | null | undefined },
    timer: { left: undefined as string | undefined, right: undefined as string | undefined },
    turnCount: undefined as string | undefined,
    eliminated: { left: undefined as number | undefined, right: undefined as number | undefined },
}

/**
 * Single entry point to the in-scene HUD.
 *
 * Every setter is a no-op while the V4 design is off, so the existing DOM
 * update sites can call them unconditionally: the HTML HUD keeps working
 * untouched, and only one of the two is ever visible.
 */
export function initGameHud(): PlayerHud | null {
    if (!ENABLE_V4_GAMEBOARD_HUD) return null
    if (hud) return hud

    hud = createPlayerHud()
    // The HTML HUD stays in the DOM (same markup as before) but is hidden.
    document.body.classList.add("in-scene-hud")

    const sides: HudSide[] = ["left", "right"]
    for (const side of sides) {
        if (state.profile[side] !== undefined) hud.setProfileImage(side, state.profile[side])
        if (state.timer[side] !== undefined) hud.setTimer(side, state.timer[side]!)
        if (state.eliminated[side] !== undefined) hud.setEliminated(side, state.eliminated[side]!)
    }
    if (state.turnCount !== undefined) hud.setTurnCount(state.turnCount)

    return hud
}

export function getGameHud(): PlayerHud | null {
    return hud
}

/** Draws the HUD over the scene. No-op when the V4 design is off. */
export function renderGameHud(renderer: THREE.WebGLRenderer) {
    hud?.render(renderer)
}

export function setHudProfileImage(side: HudSide, url: string | null | undefined) {
    state.profile[side] = url
    hud?.setProfileImage(side, url)
}

export function setHudTimer(side: HudSide, text: string) {
    state.timer[side] = text
    hud?.setTimer(side, text)
}

export function setHudTurnCount(text: string) {
    state.turnCount = text
    hud?.setTurnCount(text)
}

export function setHudEliminated(side: HudSide, count: number) {
    state.eliminated[side] = count
    hud?.setEliminated(side, count)
}

export function disposeGameHud() {
    hud?.dispose()
    hud = null
    document.body.classList.remove("in-scene-hud")
}
