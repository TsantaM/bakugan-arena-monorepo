import type { CustomAnimFn } from "../types"
import { AquosCycloneAnimation } from "./aquos-cyclone-animation"
import { AtomicBraveAnimation } from "./atomic-brave-animation"
import { BarrageDeauAnimation } from "./barrage-deau-animation"
import { CoupDeGraceAnimation } from "./coup-de-grace-animation"
import { DarkusPowerAuraAnimation } from "./darkus-power-aura-animation"
import { DemonWizardAnimation } from "./demon-wizard-animation"
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
import { MaelstromAnimation } from "./maelstrom-animation"
import { MaximumPyrusAnimation } from "./maximum-pyrus-animation"
import { MirageAquatiqueAnimation } from "./mirage-aquatique-animation"
import { MurDeFeuAnimation } from "./mur-de-feu-animation"
import { PlongeeEnEauProfondeAnimation } from "./plongee-en-eau-profonde-animation"
import { RetroActionAnimation } from "./retro-action-animation"
import { SagittariusArrowAnimation } from "./sagittarius-arrow-animation"
import { SupportLightAnimation } from "./support-light-animation"
import { TectonicSwipeAnimation } from "./tectonic-swipe-animation"
import { TornadeChaosTotalAnimation } from "./tornade-chaos-total-animation"
import { TornadeEclairAnimation } from "./tornade-eclair-animation"
import { TourbillonDeFeuAnimation } from "./tourbillon-de-feu-animation"
import { VentusTornadoMoveAnimation } from "./ventus-tornado-move-animation"
import { VisageDeLaFureurAnimation } from "./visage-de-la-fureur-animation"
import { AncreAbyssaleAnimation } from "./ancre-abyssale-animation"
import { BrasierDeSiegeAnimation } from "./brasier-de-siege-animation"
import { BriseMurailleAnimation } from "./brise-muraille-animation"
import { CarapaceReflechissanteAnimation } from "./carapace-reflechissante-animation"
import { CarapaceTetueAnimation } from "./carapace-tetue-animation"
import { ContreCourantAnimation } from "./contre-courant-animation"
import { CriDeRalliementAnimation } from "./cri-de-ralliement-animation"
import { EnigmeDuSphinxAnimation } from "./enigme-du-sphinx-animation"
import { EtreinteDePierreAnimation } from "./etreinte-de-pierre-animation"
import { GalerieDOmbreAnimation } from "./galerie-d-ombre-animation"
import { GraceSalvatriceAnimation } from "./grace-salvatrice-animation"
import { GriffesAffameesAnimation } from "./griffes-affamees-animation"
import { JugementDuLegendaireAnimation } from "./jugement-du-legendaire-animation"
import { LameUsurpatriceAnimation } from "./lame-usurpatrice-animation"
import { MareeCorrosiveAnimation } from "./maree-corrosive-animation"
import { MoissonDesAmesAnimation } from "./moisson-des-ames-animation"
import { OeilDuCycloneAnimation } from "./oeil-du-cyclone-animation"
import { PacteSanglantAnimation } from "./pacte-sanglant-animation"
import { PiqueIncendiaireAnimation } from "./pique-incendiaire-animation"
import { PoisonTickAnimation } from "./poison-tick-animation"
import { ProtocoleDEscorteAnimation } from "./protocole-d-escorte-animation"
import { RafaleAscendanteAnimation } from "./rafale-ascendante-animation"
import { RageSismiqueAnimation } from "./rage-sismique-animation"
import { RapaceEclaireurAnimation } from "./rapace-eclaireur-animation"
import { SermentDuGardienAnimation } from "./serment-du-gardien-animation"
import { SouffleDeLaVieVerteAnimation } from "./souffle-de-la-vie-verte-animation"
import { VeninRampantAnimation } from "./venin-rampant-animation"
import { VerdictDuBourreauAnimation } from "./verdict-du-bourreau-animation"

/**
 * Ability / exclusive-ability cards → custom 3D animation.
 * Key = card key (`AbilityCardsList` / `ExclusiveAbilitiesList`).
 * Add the file in this folder, then register it here.
 */
export const AbilityCustomAnimations: Partial<Record<string, CustomAnimFn>> = {
    "visage-de-la-fureur": VisageDeLaFureurAnimation,
    "dual-gazer": DualGazerAnimation,
    "coup-de-grace": CoupDeGraceAnimation,
    "demon-wizard": DemonWizardAnimation,
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
    "aquos-cyclone": AquosCycloneAnimation,
    "atomic-brave": AtomicBraveAnimation,
    "maelstrom": MaelstromAnimation,
    "maximum-pyrus": MaximumPyrusAnimation,
    "sagittarius-arrow": SagittariusArrowAnimation,
    "souffle-tout": VentusTornadoMoveAnimation,
    "tornade-extreme": VentusTornadoMoveAnimation,

    // --- Capacites exclusives ajoutees pour la profondeur strategique ---
    "souffle-de-la-vie-verte": SouffleDeLaVieVerteAnimation,
    "pique-incendiaire": PiqueIncendiaireAnimation,
    "rapace-eclaireur": RapaceEclaireurAnimation,
    "rage-sismique": RageSismiqueAnimation,
    "carapace-tetue": CarapaceTetueAnimation,
    "cri-de-ralliement": CriDeRalliementAnimation,
    "serment-du-gardien": SermentDuGardienAnimation,
    "lame-usurpatrice": LameUsurpatriceAnimation,
    "venin-rampant": VeninRampantAnimation,
    "etreinte-de-pierre": EtreinteDePierreAnimation,
    "galerie-d-ombre": GalerieDOmbreAnimation,
    "contre-courant": ContreCourantAnimation,
    "pacte-sanglant": PacteSanglantAnimation,
    "grace-salvatrice": GraceSalvatriceAnimation,
    "brise-muraille": BriseMurailleAnimation,
    "ancre-abyssale": AncreAbyssaleAnimation,
    "verdict-du-bourreau": VerdictDuBourreauAnimation,
    "moisson-des-ames": MoissonDesAmesAnimation,
    "jugement-du-legendaire": JugementDuLegendaireAnimation,
    "oeil-du-cyclone": OeilDuCycloneAnimation,
    "rafale-ascendante": RafaleAscendanteAnimation,
    "brasier-de-siege": BrasierDeSiegeAnimation,
    "carapace-reflechissante": CarapaceReflechissanteAnimation,
    "enigme-du-sphinx": EnigmeDuSphinxAnimation,
    "maree-corrosive": MareeCorrosiveAnimation,
    "protocole-d-escorte": ProtocoleDEscorteAnimation,
    "griffes-affamees": GriffesAffameesAnimation,

    // Animation de statut, rejouee a chaque tour par ApplyTurnStatusEffects
    "status:poison-tick": PoisonTickAnimation,
}
