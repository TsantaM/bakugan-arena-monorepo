import type { CustomAnimFn } from "../types"
import { ElementaryAquosAnimation } from "./elementary/elementary-aquos-animation"
import { ElementaryDarkusAnimation } from "./elementary/elementary-darkus-animation"
import { ElementaryHaosAnimation } from "./elementary/elementary-haos-animation"
import { ElementaryPyrusAnimation } from "./elementary/elementary-pyrus-animation"
import { ElementarySubterraAnimation } from "./elementary/elementary-subterra-animation"
import { ElementaryVentusAnimation } from "./elementary/elementary-ventus-animation"
import { CharacterGateAnimation } from "./character-gate-animation"
import { MineGhostAnimation } from "./mine-ghost-animation"
import {
    AspirateurDePuissanceAnimation,
    GrandEspritAnimation,
    RechargementAnimation,
} from "./power-drain-gate-animation"

/**
 * Gate cards → custom 3D animation.
 *
 * Key = the gate animation key prefixed by `gate:` (see
 * `GateCustomAnimationDirective` in `@bakugan-arena/game-data`). The prefix
 * avoids collisions with ability card keys (`reacteur-subterra`,
 * `retour-d-air`… exist on both sides).
 *
 * To add one:
 *  1. create `<key>-animation.ts` in this folder, exporting a `CustomAnimFn`
 *  2. register it below
 *  3. in the gate card effect (libs/game-data), call
 *     `GateCustomAnimationDirective({ roomState, gateKey: '<key>', slotId, ... })`
 *
 * Generic gate animations (open / set / move / remove / cancel) stay in
 * `src/animations/` — this folder is only for card-specific visuals.
 */
export const GateCustomAnimations: Partial<Record<string, CustomAnimFn>> = {
    // Elementary gates (Réacteur *): one environment per attribute, shared boost aura.
    "gate:elementary-pyrus": ElementaryPyrusAnimation,
    "gate:elementary-aquos": ElementaryAquosAnimation,
    "gate:elementary-ventus": ElementaryVentusAnimation,
    "gate:elementary-subterra": ElementarySubterraAnimation,
    "gate:elementary-haos": ElementaryHaosAnimation,
    "gate:elementary-darkus": ElementaryDarkusAnimation,

    // Character gates: energy released by the card, aura on its family.
    "gate:character": CharacterGateAnimation,

    "gate:mine-fantome": MineGhostAnimation,

    // Power siphons: same drain, different sources.
    "gate:aspirateur-de-puissance": AspirateurDePuissanceAnimation,
    "gate:grand-esprit": GrandEspritAnimation,
    "gate:rechargement": RechargementAnimation,
}
