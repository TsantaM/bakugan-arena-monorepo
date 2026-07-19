import type { CustomAnimFn } from "./types"
import { VisageDeLaFureurAnimation } from "./visage-de-la-fureur-animation"

/**
 * Registry of card-key → custom 3D animation.
 * Only cards with a dedicated visual need an entry here.
 * Missing keys are treated as no-ops by the animation player.
 */
export const CustomAnimationsRegistry: Partial<Record<string, CustomAnimFn>> = {
    "visage-de-la-fureur": VisageDeLaFureurAnimation,
}
