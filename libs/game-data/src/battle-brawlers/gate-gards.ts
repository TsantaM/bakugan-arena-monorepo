import { FusionAerienne, FusionEnflammee, FusionLumineuse, FusionMarine, FusionTenebreuses, FusionTerrestre, PerilAquos, PerilDarkus, PerilHaos, PerilPyrus, PerilSubterra, PerilVentus, ReacteurAquos, ReacteurDarkus, ReacteurHaos, ReacteurPyrus, ReacteurSubterra, ReacteurVentus } from "./gate-card/gate-card-elementary";
import { AspirateurDePuissance, Echange, MineFantome, SuperPyrus } from "./gate-card/gate-card-trap";
import { Armistice, BoucEmissaire, GrandEsprit, QuatuorDeCombat, Rechargement, RetourDAssenceur, TripleCombat } from "./gate-card/gate-card-command";
import { gateCardType } from "../type/game-data-types";
import { CentipodGateCard } from "./bakugans/centipod";
import { CycloidGateCard } from "./bakugans/cycloid";
import { DragonoidGateCard } from "./bakugans/dragonoid";
import { ElCondorGateCard } from "./bakugans/el-condor";
import { FalconeerGateCard } from "./bakugans/falconeer";
import { FearReaperGateCard } from "./bakugans/fear-reaper";
import { FortressGateCard } from "./bakugans/fourtress";
import { GarganoidGateCard } from "./bakugans/garganoid";
import { GoremGateCard } from "./bakugans/gorem";
import { GriffinGateCard } from "./bakugans/griffin";
import { HydranoidGateCard } from "./bakugans/hydranoid";
import { LimulusGateCard } from "./bakugans/limulus";
import { MantrisGateCard } from "./bakugans/mantris";
import { MonarusGateCard } from "./bakugans/monarus";
import { AngeloGateCard, DiabloGateCard, PreyasGateCard } from "./bakugans/preyas";
import { RavenoidGateCard } from "./bakugans/ravenoid";
import { ReaperGateCard } from "./bakugans/reaper";
import { RobotallionGateCard } from "./bakugans/robotallion";
import { SaurusGateCard } from "./bakugans/saurus";
import { SiegeGateCard } from "./bakugans/siege";
import { SirenoidGateCard } from "./bakugans/sirenoid";
import { SkyressGateCard } from "./bakugans/skyress";
import { StinglashGateCard } from "./bakugans/stinglash";
import { TentaclearGateCard } from "./bakugans/tentacleer";
import { WormquakeGateCard } from "./bakugans/wormquake";
import { TigrerraGateCard } from "./bakugans/tigrerra";

export const GateCards: Record<string, gateCardType> = {

    // Reacteurs

    [ReacteurPyrus.key]: ReacteurPyrus,
    [ReacteurSubterra.key]: ReacteurSubterra,
    [ReacteurHaos.key]: ReacteurHaos,
    [ReacteurVentus.key]: ReacteurVentus,
    [ReacteurAquos.key]: ReacteurAquos,
    [ReacteurDarkus.key]: ReacteurDarkus,


    // Péril

    [PerilPyrus.key]: PerilPyrus,
    [PerilVentus.key]: PerilVentus,
    [PerilAquos.key]: PerilAquos,
    [PerilSubterra.key]: PerilSubterra,
    [PerilHaos.key]: PerilHaos,
    [PerilDarkus.key]: PerilDarkus,


    // Fusions

    [FusionEnflammee.key]: FusionEnflammee,
    [FusionAerienne.key]: FusionAerienne,
    [FusionMarine.key]: FusionMarine,
    [FusionTerrestre.key]: FusionTerrestre,
    [FusionLumineuse.key]: FusionLumineuse,
    [FusionTenebreuses.key]: FusionTenebreuses,

    // Piège

    [MineFantome.key]: MineFantome,
    [Echange.key]: Echange,
    [SuperPyrus.key]: SuperPyrus,
    [AspirateurDePuissance.key]: AspirateurDePuissance,

    // Commandement

    [Rechargement.key]: Rechargement,
    [TripleCombat.key]: TripleCombat,
    [QuatuorDeCombat.key]: QuatuorDeCombat,
    [RetourDAssenceur.key]: RetourDAssenceur,
    [BoucEmissaire.key]: BoucEmissaire,
    [Armistice.key]: Armistice,
    [GrandEsprit.key]: GrandEsprit,

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
}

export const GateCardsList: gateCardType[] = Object.values(GateCards) 