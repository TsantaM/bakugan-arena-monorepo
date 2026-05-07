import { abilityCardsType } from "../index.js";
import { BarrageDeau, DepthDive, FlowInterference, MirageAquatique, PlongeeEnEauProfonde } from "./ability-cards/aquos.js";
import { PyrusAquosHaos, VentusSubterraDarkus } from "./ability-cards/combination-triple.js";
import { AquosVentus, DarkusAquos, HaosDarkus, SubterraHaos, SubterraPyrus, VentusPyrus } from "./ability-cards/combinations-simple.js";
import { CoupDeGrace, ShadowReversal, VengeanceAlItalienne } from "./ability-cards/darkus.js";
import { AquosSubterra, DarkusPyrus, HaosVentus, PyrusDarkus, SubterraAquos, VentusHaos } from "./ability-cards/diagonal-combination.js";
import { ContreMaitrise, EclatSoudain, HaosImmobilisation, SupportLight } from "./ability-cards/haos.js";
import { BlazeReversal, JetEnflamme, MurDeFeu, RetroAction, TourbillonDeFeu } from "./ability-cards/pyrus.js";
import { EarthPower, EarthShatter, MagmaSupreme, TectonicSwipe, TerraLockdown } from "./ability-cards/subterra.js";
import { CombatAerien, RetourDair, SouffleTout, StormCancel, TornadeChaosTotal, TornadeExtreme } from "./ability-cards/ventus.js";

export const AbilityCards: Record<string, abilityCardsType> = {
    // Pyrus

    [MurDeFeu.key]: MurDeFeu,
    [JetEnflamme.key]: JetEnflamme,
    [RetroAction.key]: RetroAction,
    [TourbillonDeFeu.key]: TourbillonDeFeu,
    [PyrusDarkus.key]: PyrusDarkus,
    [SubterraPyrus.key]: SubterraPyrus,
    [BlazeReversal.key]: BlazeReversal,

    // Aquos

    [MirageAquatique.key]: MirageAquatique,
    [BarrageDeau.key]: BarrageDeau,
    // [BouclierAquos.key]: BouclierAquos,
    [PlongeeEnEauProfonde.key]: PlongeeEnEauProfonde,
    [AquosSubterra.key]: AquosSubterra,
    [AquosVentus.key]: AquosVentus,
    [DepthDive.key]: DepthDive,
    [FlowInterference.key]: FlowInterference,

    // Subterra

    [MagmaSupreme.key]: MagmaSupreme,
    // [ChuteColossale.key]: ChuteColossale,
    // [CopieConforme.key]: CopieConforme,
    [TectonicSwipe.key]: TectonicSwipe,
    [EarthPower.key]: EarthPower,
    [SubterraAquos.key]: SubterraAquos,
    [SubterraHaos.key]: SubterraHaos,
    [EarthShatter.key]: EarthShatter,
    [TerraLockdown.key]: TerraLockdown,

    // Haos

    // [RapideHaos.key]: RapideHaos,
    [EclatSoudain.key]: EclatSoudain,
    // [LumiereDivine.key]: LumiereDivine,
    [ContreMaitrise.key]: ContreMaitrise,
    [HaosImmobilisation.key]: HaosImmobilisation,
    [SupportLight.key]: SupportLight,
    [HaosDarkus.key]: HaosDarkus,
    [HaosVentus.key]: HaosVentus,

    // Darkus

    [CoupDeGrace.key]: CoupDeGrace,
    // [EpicesMortelles.key]: EpicesMortelles,
    [VengeanceAlItalienne.key]: VengeanceAlItalienne,
    [ShadowReversal.key]: ShadowReversal,
    // [PoivreDesCayenne.key]: PoivreDesCayenne,
    [DarkusAquos.key]: DarkusAquos,
    [DarkusPyrus.key]: DarkusPyrus,

    // Ventus

    [CombatAerien.key]: CombatAerien,
    [TornadeChaosTotal.key]: TornadeChaosTotal,
    [SouffleTout.key]: SouffleTout,
    [RetourDair.key]: RetourDair,
    [TornadeExtreme.key]: TornadeExtreme,
    [VentusHaos.key]: VentusHaos,
    [VentusPyrus.key]: VentusPyrus,
    [StormCancel.key]: StormCancel,

    // Combination Triple
    [PyrusAquosHaos.key]: PyrusAquosHaos,
    [VentusSubterraDarkus.key]: VentusSubterraDarkus
}

export const AbilityCardsList: abilityCardsType[] = Object.values(AbilityCards) 