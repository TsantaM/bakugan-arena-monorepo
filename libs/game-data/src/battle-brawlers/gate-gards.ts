import { ReacteurAquos, ReacteurDarkus, ReacteurHaos, ReacteurPyrus, ReacteurSubterra, ReacteurVentus } from "./gate-card/gate-card-elementary.js";
import { type gateCardType } from "../index.js";
import { CentipodGateCard } from "./bakugans/centipod.js";
import { CycloidGateCard } from "./bakugans/cycloid.js";
import { DragonoidGateCard } from "./bakugans/dragonoid.js";
import { ElCondorGateCard } from "./bakugans/el-condor.js";
import { FalconeerGateCard } from "./bakugans/falconeer.js";
import { FearReaperGateCard } from "./bakugans/fear-reaper.js";
import { FortressGateCard } from "./bakugans/fourtress.js";
import { GarganoidGateCard } from "./bakugans/garganoid.js";
import { GoremGateCard } from "./bakugans/gorem.js";
import { GriffinGateCard } from "./bakugans/griffin.js";
import { HydranoidGateCard } from "./bakugans/hydranoid.js";
import { LimulusGateCard } from "./bakugans/limulus.js";
import { MantrisGateCard } from "./bakugans/mantris.js";
import { MonarusGateCard } from "./bakugans/monarus.js";
import { AngeloGateCard, DiabloGateCard, PreyasGateCard } from "./bakugans/preyas.js";
import { RavenoidGateCard } from "./bakugans/ravenoid.js";
import { ReaperGateCard } from "./bakugans/reaper.js";
import { RobotallionGateCard } from "./bakugans/robotallion.js";
import { SaurusGateCard } from "./bakugans/saurus.js";
import { SiegeGateCard } from "./bakugans/siege.js";
import { SirenoidGateCard } from "./bakugans/sirenoid.js";
import { SkyressGateCard } from "./bakugans/skyress.js";
import { StinglashGateCard } from "./bakugans/stinglash.js";
import { TentaclearGateCard } from "./bakugans/tentacleer.js";
import { WormquakeGateCard } from "./bakugans/wormquake.js";
import { TigrerraGateCard } from "./bakugans/tigrerra.js";
import { JuggernoidGateCard } from "./bakugans/juggernoid.js";
import { BeeStrikerGateCard } from "./bakugans/bee-striker.js";
import { TuskorGateCard } from "./bakugans/tuskor.js";
import { LasermanGateCard } from "./bakugans/laserman.js";
import { ManionGateCard } from "./bakugans/manion.js";
import { Rechargement } from "./gate-card/command/rechergement.js";
import { TripleCombat } from "./gate-card/command/tripple-battle.js";
import { QuatuorDeCombat } from "./gate-card/command/quartet-battle.js";
import { Armistice } from "./gate-card/command/armistice.js";
import { GrandEsprit } from "./gate-card/command/grand-esprit.js";
import { Magma } from "./gate-card/command/magma.js";
import { Revive } from "./gate-card/command/revive.js";
import { Androstasis } from "./gate-card/command/androstasis.js";
import { MineFantome } from "./gate-card/trap/mine-ghost.js";
import { Echange } from "./gate-card/trap/trad-off.js";
import { SuperPyrus } from "./gate-card/trap/super-pyrus.js";
import { AspirateurDePuissance } from "./gate-card/trap/energy-merge.js";

export const GateCards: Record<string, gateCardType> = {

    // Reacteurs

    [ReacteurPyrus.key]: ReacteurPyrus,
    [ReacteurSubterra.key]: ReacteurSubterra,
    [ReacteurHaos.key]: ReacteurHaos,
    [ReacteurVentus.key]: ReacteurVentus,
    [ReacteurAquos.key]: ReacteurAquos,
    [ReacteurDarkus.key]: ReacteurDarkus,


    // Péril

    // [PerilPyrus.key]: PerilPyrus,
    // [PerilVentus.key]: PerilVentus,
    // [PerilAquos.key]: PerilAquos,
    // [PerilSubterra.key]: PerilSubterra,
    // [PerilHaos.key]: PerilHaos,
    // [PerilDarkus.key]: PerilDarkus,


    // Fusions

    // [FusionEnflammee.key]: FusionEnflammee,
    // [FusionAerienne.key]: FusionAerienne,
    // [FusionMarine.key]: FusionMarine,
    // [FusionTerrestre.key]: FusionTerrestre,
    // [FusionLumineuse.key]: FusionLumineuse,
    // [FusionTenebreuses.key]: FusionTenebreuses,

    // Piège

    [MineFantome.key]: MineFantome,
    [Echange.key]: Echange,
    [SuperPyrus.key]: SuperPyrus,
    [AspirateurDePuissance.key]: AspirateurDePuissance,

    // Commandement

    [Rechargement.key]: Rechargement,
    [TripleCombat.key]: TripleCombat,
    [QuatuorDeCombat.key]: QuatuorDeCombat,
    // [RetourDAssenceur.key]: RetourDAssenceur,
    // [BoucEmissaire.key]: BoucEmissaire,
    [Armistice.key]: Armistice,
    [GrandEsprit.key]: GrandEsprit,
    [Magma.key]: Magma,
    [Androstasis.key]: Androstasis,
    [Revive.key]: Revive,

    // Caracter Gate Cards
    [CentipodGateCard.key]: CentipodGateCard,
    [CycloidGateCard.key]: CycloidGateCard,
    [DragonoidGateCard.key]: DragonoidGateCard,
    [ElCondorGateCard.key]: ElCondorGateCard,
    [FalconeerGateCard.key]: FalconeerGateCard,
    [FearReaperGateCard.key]: FearReaperGateCard,
    [FortressGateCard.key]: FortressGateCard,
    [GarganoidGateCard.key]: GarganoidGateCard,
    [GoremGateCard.key]: GoremGateCard,
    [GriffinGateCard.key]: GriffinGateCard,
    [HydranoidGateCard.key]: HydranoidGateCard,
    [LimulusGateCard.key]: LimulusGateCard,
    [MantrisGateCard.key]: MantrisGateCard,
    [MonarusGateCard.key]: MonarusGateCard,
    [PreyasGateCard.key]: PreyasGateCard,
    [DiabloGateCard.key]: DiabloGateCard,
    [AngeloGateCard.key]: AngeloGateCard,
    [RavenoidGateCard.key]: RavenoidGateCard,
    [ReaperGateCard.key]: ReaperGateCard,
    [RobotallionGateCard.key]: RobotallionGateCard,
    [SaurusGateCard.key]: SaurusGateCard,
    [SiegeGateCard.key]: SiegeGateCard,
    [SirenoidGateCard.key]: SirenoidGateCard,
    [SkyressGateCard.key]: SkyressGateCard,
    [StinglashGateCard.key]: StinglashGateCard,
    [TentaclearGateCard.key]: TentaclearGateCard,
    [WormquakeGateCard.key]: WormquakeGateCard,
    [TigrerraGateCard.key]: TigrerraGateCard,
    [LimulusGateCard.key]: LimulusGateCard,
    [RobotallionGateCard.key]: RobotallionGateCard,
    [JuggernoidGateCard.key]: JuggernoidGateCard,
    [BeeStrikerGateCard.key]: BeeStrikerGateCard,
    [TuskorGateCard.key]: TuskorGateCard,
    [LasermanGateCard.key]: LasermanGateCard,
    [ManionGateCard.key]: ManionGateCard
    
}

export const GateCardsList: gateCardType[] = Object.values(GateCards) 