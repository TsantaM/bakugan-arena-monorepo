import type { CustomAnimFn } from "./types"
import { CoupDeGraceAnimation } from "./coup-de-grace-animation"
import { DualGazerAnimation } from "./dual-gazer-animation"
import { VisageDeLaFureurAnimation } from "./visage-de-la-fureur-animation"

/**
 * Registry of card-key → custom 3D animation.
 * Only cards with a dedicated visual need an entry here.
 * Missing keys are treated as no-ops by the animation player.
 */
export const CustomAnimationsRegistry: Partial<Record<string, CustomAnimFn>> = {
    "visage-de-la-fureur": VisageDeLaFureurAnimation,
    "dual-gazer": DualGazerAnimation,
    "coup-de-grace": CoupDeGraceAnimation,
}

/** Keys with a dedicated 3D custom animation (kept in sync for sandbox Animation Lab). */
export const CUSTOM_ANIMATION_KEYS = Object.keys(CustomAnimationsRegistry)
