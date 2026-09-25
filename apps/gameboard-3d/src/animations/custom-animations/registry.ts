import type { CustomAnimFn } from "./types"
import { AbilityCustomAnimations } from "./ability-cards/registry"
import { GateCustomAnimations } from "./gate-cards/registry"

/**
 * Registry of animation key → custom 3D animation, played by the
 * `CUSTOM_ANIMATION` directive.
 *
 * - ability / exclusive ability cards: `./ability-cards` (key = card key)
 * - gate cards: `./gate-cards` (key = `gate:<gate-card-key>`)
 *
 * Generic animations (open/set/move/remove a gate, power change, …) live in
 * `src/animations/` and are not part of this registry.
 * Missing keys are treated as no-ops by the animation player.
 */
export const CustomAnimationsRegistry: Partial<Record<string, CustomAnimFn>> = {
    ...AbilityCustomAnimations,
    ...GateCustomAnimations,
}

/** Keys with a dedicated 3D custom animation (kept in sync for sandbox Animation Lab). */
export const CUSTOM_ANIMATION_KEYS = Object.keys(CustomAnimationsRegistry)

export { AbilityCustomAnimations, GateCustomAnimations }
