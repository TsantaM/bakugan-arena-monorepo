import type { CustomAnimFn } from "./types"
import { BarrageDeauAnimation } from "./barrage-deau-animation"
import { CoupDeGraceAnimation } from "./coup-de-grace-animation"
import { DarkusPowerAuraAnimation } from "./darkus-power-aura-animation"
import { DepthDiveAnimation } from "./depth-dive-animation"
import { DestructionMeteorStormAnimation } from "./destruction-meteor-storm-animation"
import { DualGazerAnimation } from "./dual-gazer-animation"
import { DStrikeAttackAnimation } from "./d-strike-attack-animation"
import { EarthPowerAnimation } from "./earth-power-animation"
import { EarthShatterAnimation } from "./earth-shatter-animation"
import { EclatSoudainAnimation } from "./eclat-soudain-animation"
import { FlareBlinderAnimation } from "./flare-blinder-animation"
import { HaosImmobilisationAnimation } from "./haos-immobilisation-animation"
import { HolographDivideAnimation } from "./holograph-divide-animation"
import { JetEnflammeAnimation } from "./jet-enflamme-animation"
import { MirageAquatiqueAnimation } from "./mirage-aquatique-animation"
import { MurDeFeuAnimation } from "./mur-de-feu-animation"
import { PlongeeEnEauProfondeAnimation } from "./plongee-en-eau-profonde-animation"
import { RetroActionAnimation } from "./retro-action-animation"
import { SupportLightAnimation } from "./support-light-animation"
import { TectonicSwipeAnimation } from "./tectonic-swipe-animation"
import { TornadeChaosTotalAnimation } from "./tornade-chaos-total-animation"
import { TornadeEclairAnimation } from "./tornade-eclair-animation"
import { TourbillonDeFeuAnimation } from "./tourbillon-de-feu-animation"
import { VentusTornadoMoveAnimation } from "./ventus-tornado-move-animation"
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
    "epices-mortelles": DarkusPowerAuraAnimation,
    "vengeance-a-l'italienne": DarkusPowerAuraAnimation,
    "poivre-des-cayenne": DarkusPowerAuraAnimation,
    "gust-of-wind-blow-destruction-meteor-storm": DestructionMeteorStormAnimation,
    "d-strike-attack": DStrikeAttackAnimation,
    "barrage-d'eau": BarrageDeauAnimation,
    "mirage-aquatique": MirageAquatiqueAnimation,
    "holograph-divide": HolographDivideAnimation,
    "eclat-soudain": EclatSoudainAnimation,
    "flare-blinder": FlareBlinderAnimation,
    "mega-flare-blinder": FlareBlinderAnimation,
    "haos-immobilisation": HaosImmobilisationAnimation,
    "support-light": SupportLightAnimation,
    "tornade-eclair": TornadeEclairAnimation,
    "plongee-en-eau-profonde": PlongeeEnEauProfondeAnimation,
    "depth-dive": DepthDiveAnimation,
    "jet-enflamme": JetEnflammeAnimation,
    "retro-action": RetroActionAnimation,
    "mur-de-feu": MurDeFeuAnimation,
    "tourbillon-de-feu": TourbillonDeFeuAnimation,
    "tectonic-swipe": TectonicSwipeAnimation,
    "earth-power": EarthPowerAnimation,
    "earth-shatter": EarthShatterAnimation,
    "tornade-chaos-total": TornadeChaosTotalAnimation,
    "souffle-tout": VentusTornadoMoveAnimation,
    "tornade-extreme": VentusTornadoMoveAnimation,
}

/** Keys with a dedicated 3D custom animation (kept in sync for sandbox Animation Lab). */
export const CUSTOM_ANIMATION_KEYS = Object.keys(CustomAnimationsRegistry)
