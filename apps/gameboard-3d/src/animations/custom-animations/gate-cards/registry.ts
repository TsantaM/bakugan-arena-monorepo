import type { CustomAnimFn } from "../types"

/**
 * Gate cards → custom 3D animation.
 *
 * Key = the gate card key prefixed by `gate:` (see `GateCustomAnimationDirective`
 * in `@bakugan-arena/game-data`). The prefix avoids collisions with ability card
 * keys (`reacteur-subterra`, `retour-d-air`… exist on both sides).
 *
 * To add one:
 *  1. create `<gate-key>-animation.ts` in this folder, exporting a `CustomAnimFn`
 *  2. register it below
 *  3. in the gate card `onOpen` (libs/game-data), call
 *     `GateCustomAnimationDirective({ roomState, gateKey: '<gate-key>', slotId, ... })`
 *
 * Generic gate animations (open / set / move / remove / cancel) stay in
 * `src/animations/` — this folder is only for card-specific visuals.
 */
export const GateCustomAnimations: Partial<Record<string, CustomAnimFn>> = {}
