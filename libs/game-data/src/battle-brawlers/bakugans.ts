
import { DragonoidDeltaPyrus, DragonoidPyrus, UltimateDragonoid } from "./bakugans/dragonoid";
import { SkyressStormVentus, SkyressVentus } from "./bakugans/skyress";
import { AngeloAquos, DiabloAquos, PreyasAquos } from "./bakugans/preyas";
import { GoremSubterra, HammerGoremSubterra } from "./bakugans/gorem";
import { BladeTigrerraHaos, TigrerraHaos } from "./bakugans/tigrerra";
import { AlphaHydranoidDarkus, DeltaHydranoidDarkus, HydranoidDarkus } from "./bakugans/hydranoid";
import { SirenoidAquos } from "./bakugans/sirenoid";
import { GriffinAquos, GriffinHaos, GriffinPyrus } from "./bakugans/griffin";
import { FourtressPyrus } from "./bakugans/fourtress";
import { CycloidSubterra } from "./bakugans/cycloid";
import { HarpusVentus } from "./bakugans/harpus";
import { TentaclearHaos } from "./bakugans/tentacleer";
import { ReaperDarkus } from "./bakugans/reaper";
import { MantrisDarkus, MantrisHaos, MantrisPyrus, MantrisSubterra } from "./bakugans/mantris";
import { SaurusHaos, SaurusPyrus, SaurusSubterra } from "./bakugans/saurus";
import { RobotallionAquos, RobotallionDarkus, RobotallionHaos, RobotallionPyrus } from "./bakugans/robotallion";
import { ElCondorHaos, ElCondorSubterra, ElCondorVentus } from "./bakugans/el-condor";
import { RavenoidHaos, RavenoidPyrus, RavenoidVentus } from "./bakugans/ravenoid";
import { FalconeerPyrus, FalconeerVentus } from "./bakugans/falconeer";
import { MonarusVentus } from "./bakugans/monarus";
import { SiegeAquos, SiegeDarkus, SiegeHaos, SiegePyrus } from "./bakugans/siege";
import { FearReaperAquos, FearReaperDarkus, FearReaperHaos, FearReaperPyrus } from "./bakugans/fear-reaper";
import { WormquakeDarkus, WormquakeSubterra } from "./bakugans/wormquake";
import { StinglashAquos, StinglashDarkus, StinglashSubterra } from "./bakugans/stinglash";
import { LimulusAquos } from "./bakugans/limulus";
import { CentipodDarkus, CentipodHaos, CentipodPyrus, CentipodSubterra } from "./bakugans/centipod";
import { GaraganoidAquos, GarganoidPyrus } from "./bakugans/garganoid";
import { bakuganType } from "../type/game-data-types";

export const Bakugans: Record<string, bakuganType> = {
    [DragonoidPyrus.key]: DragonoidPyrus,
    [DragonoidDeltaPyrus.key]: DragonoidDeltaPyrus,
    [UltimateDragonoid.key]: UltimateDragonoid,

    [SkyressVentus.key]: SkyressVentus,
    [SkyressStormVentus.key]: SkyressStormVentus,

    [PreyasAquos.key]: PreyasAquos,
    [DiabloAquos.key]: DiabloAquos,
    [AngeloAquos.key]: AngeloAquos,

    [GoremSubterra.key]: GoremSubterra,
    [HammerGoremSubterra.key]: HammerGoremSubterra,

    [TigrerraHaos.key]: TigrerraHaos,
    [BladeTigrerraHaos.key]: BladeTigrerraHaos,

    [HydranoidDarkus.key]: HydranoidDarkus,
    [DeltaHydranoidDarkus.key]: DeltaHydranoidDarkus,
    [AlphaHydranoidDarkus.key]: AlphaHydranoidDarkus,

    [SirenoidAquos.key]: SirenoidAquos,
    [FourtressPyrus.key]: FourtressPyrus,
    [CycloidSubterra.key]: CycloidSubterra,
    [HarpusVentus.key]: HarpusVentus,
    [TentaclearHaos.key]: TentaclearHaos,
    [ReaperDarkus.key]: ReaperDarkus,

    [GriffinAquos.key]: GriffinAquos,
    [GriffinPyrus.key]: GriffinPyrus,
    [GriffinHaos.key]: GriffinHaos,

    [MantrisPyrus.key]: MantrisPyrus,
    [MantrisDarkus.key]: MantrisDarkus,
    [MantrisHaos.key]: MantrisHaos,
    [MantrisSubterra.key]: MantrisSubterra,

    [SaurusPyrus.key]: SaurusPyrus,
    [SaurusHaos.key]: SaurusHaos,
    [SaurusSubterra.key]: SaurusSubterra,

    [RobotallionPyrus.key]: RobotallionPyrus,
    [RobotallionAquos.key]: RobotallionAquos,
    [RobotallionDarkus.key]: RobotallionDarkus,
    [RobotallionHaos.key]: RobotallionHaos,

    [ElCondorHaos.key]: ElCondorHaos,
    [ElCondorVentus.key]: ElCondorVentus,
    [ElCondorSubterra.key]: ElCondorSubterra,

    [RavenoidPyrus.key]: RavenoidPyrus,
    [RavenoidHaos.key]: RavenoidHaos,
    [RavenoidVentus.key]: RavenoidVentus,

    [FalconeerPyrus.key]: FalconeerPyrus,
    [FalconeerVentus.key]: FalconeerVentus,

    [MonarusVentus.key]: MonarusVentus,

    [SiegePyrus.key]: SiegePyrus,
    [SiegeHaos.key]: SiegeHaos,
    [SiegeAquos.key]: SiegeAquos,
    [SiegeDarkus.key]: SiegeDarkus,

    [FearReaperPyrus.key]: FearReaperPyrus,
    [FearReaperAquos.key]: FearReaperAquos,
    [FearReaperDarkus.key]: FearReaperDarkus,
    [FearReaperHaos.key]: FearReaperHaos,

    [WormquakeSubterra.key]: WormquakeSubterra,
    [WormquakeDarkus.key]: WormquakeDarkus,

    [StinglashAquos.key]: StinglashAquos,
    [StinglashDarkus.key]: StinglashDarkus,
    [StinglashSubterra.key]: StinglashSubterra,

    [LimulusAquos.key]: LimulusAquos,

    [CentipodDarkus.key]: CentipodDarkus,
    [CentipodHaos.key]: CentipodHaos,
    [CentipodPyrus.key]: CentipodPyrus,
    [CentipodSubterra.key]: CentipodSubterra,

    [GarganoidPyrus.key]: GarganoidPyrus,
    [GaraganoidAquos.key]: GaraganoidAquos
}

export const BakuganList: bakuganType[] = Object.values(Bakugans) 