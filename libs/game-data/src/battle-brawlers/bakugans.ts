
import { DragonoidPyrus } from "./bakugans/dragonoid.js";
import { SkyressVentus } from "./bakugans/skyress.js";
import { PreyasAquos } from "./bakugans/preyas.js";
import { GoremSubterra } from "./bakugans/gorem.js";
import { TigrerraHaos } from "./bakugans/tigrerra.js";
import { HydranoidDarkus } from "./bakugans/hydranoid.js";
import { SirenoidAquos } from "./bakugans/sirenoid.js";
import { GriffinPyrus } from "./bakugans/griffin.js";
import { FourtressPyrus } from "./bakugans/fourtress.js";
import { CycloidSubterra } from "./bakugans/cycloid.js";
import { HarpusVentus } from "./bakugans/harpus.js";
import { TentaclearHaos } from "./bakugans/tentacleer.js";
import { ReaperDarkus } from "./bakugans/reaper.js";
import { MantrisDarkus, MantrisHaos, MantrisPyrus, MantrisSubterra } from "./bakugans/mantris.js";
import { SaurusHaos, SaurusPyrus, SaurusSubterra } from "./bakugans/saurus.js";
import { ElCondorHaos, ElCondorSubterra, ElCondorVentus } from "./bakugans/el-condor.js";
import { RavenoidHaos, RavenoidPyrus, RavenoidVentus } from "./bakugans/ravenoid.js";
import { FalconeerPyrus, FalconeerVentus } from "./bakugans/falconeer.js";
import { MonarusVentus } from "./bakugans/monarus.js";
import { SiegeAquos, SiegeDarkus, SiegeHaos, SiegePyrus } from "./bakugans/siege.js";
import { FearReaperAquos, FearReaperDarkus, FearReaperHaos, FearReaperPyrus } from "./bakugans/fear-reaper.js";
import { WormquakeDarkus, WormquakeSubterra } from "./bakugans/wormquake.js";
import { StinglashAquos, StinglashDarkus, StinglashSubterra } from "./bakugans/stinglash.js";
import { CentipodDarkus, CentipodHaos, CentipodPyrus, CentipodSubterra } from "./bakugans/centipod.js";
import { bakuganType } from "../index.js";

export const Bakugans: Record<string, bakuganType> = {
    [DragonoidPyrus.key]: DragonoidPyrus,
    // [DragonoidDeltaPyrus.key]: DragonoidDeltaPyrus,
    // [UltimateDragonoid.key]: UltimateDragonoid,

    [SkyressVentus.key]: SkyressVentus,
    // [SkyressStormVentus.key]: SkyressStormVentus,

    [PreyasAquos.key]: PreyasAquos,
    // [DiabloAquos.key]: DiabloAquos,
    // [AngeloAquos.key]: AngeloAquos,

    [GoremSubterra.key]: GoremSubterra,
    // [HammerGoremSubterra.key]: HammerGoremSubterra,

    [TigrerraHaos.key]: TigrerraHaos,
    // [BladeTigrerraHaos.key]: BladeTigrerraHaos,

    [HydranoidDarkus.key]: HydranoidDarkus,
    // [DeltaHydranoidDarkus.key]: DeltaHydranoidDarkus,
    // [AlphaHydranoidDarkus.key]: AlphaHydranoidDarkus,

    [SirenoidAquos.key]: SirenoidAquos,
    [FourtressPyrus.key]: FourtressPyrus,
    [CycloidSubterra.key]: CycloidSubterra,
    [HarpusVentus.key]: HarpusVentus,
    [TentaclearHaos.key]: TentaclearHaos,
    [ReaperDarkus.key]: ReaperDarkus,

    // [GriffinAquos.key]: GriffinAquos,
    [GriffinPyrus.key]: GriffinPyrus,
    // [GriffinHaos.key]: GriffinHaos,

    [MantrisPyrus.key]: MantrisPyrus,
    [MantrisDarkus.key]: MantrisDarkus,
    [MantrisHaos.key]: MantrisHaos,
    [MantrisSubterra.key]: MantrisSubterra,

    [SaurusPyrus.key]: SaurusPyrus,
    [SaurusHaos.key]: SaurusHaos,
    [SaurusSubterra.key]: SaurusSubterra,

    // [RobotallionPyrus.key]: RobotallionPyrus,
    // [RobotallionAquos.key]: RobotallionAquos,
    // [RobotallionDarkus.key]: RobotallionDarkus,
    // [RobotallionHaos.key]: RobotallionHaos,

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

    // [LimulusAquos.key]: LimulusAquos,

    [CentipodDarkus.key]: CentipodDarkus,
    [CentipodHaos.key]: CentipodHaos,
    [CentipodPyrus.key]: CentipodPyrus,
    [CentipodSubterra.key]: CentipodSubterra,

    // [GarganoidPyrus.key]: GarganoidPyrus,
    // [GaraganoidAquos.key]: GaraganoidAquos
}

export const BakuganList: bakuganType[] = Object.values(Bakugans) 