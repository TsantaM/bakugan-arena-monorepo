import { JetEnflamme, MurDeFeu, RetroAction, TourbillonDeFeu } from "./ability-cards/pyrus";
import { BarrageDeau, BouclierAquos, MirageAquatique, PlongeeEnEauProfonde } from "./ability-cards/aquos";
import { ChuteColossale, CopieConforme, ForceDattraction, MagmaSupreme, Obstruction } from "./ability-cards/subterra";
import { ContreMaitrise, EclatSoudain, HaosImmobilisation, LumiereDivine, RapideHaos } from "./ability-cards/haos";
import { BoublierFusion, CoupDeGrace, EpicesMortelles, PoivreDesCayenne, VengeanceAlItalienne } from "./ability-cards/darkus";
import { CombatAerien, RetourDair, SouffleTout, TornadeChaosTotal, TornadeExtreme } from "./ability-cards/ventus";
import { abilityCardsType } from "../type/game-data-types";
import { AquosSubterra, DarkusPyrus, HaosVentus, PyrusDarkus, SubterraAquos, VentusHaos } from "./ability-cards/diagonal-combination";
import { AquosVentus, DarkusAquos, HaosDarkus, SubterraHaos, SubterraPyrus, VentusPyrus } from "./ability-cards/combinations-simple";
import { PyrusAquosHaos, VentusSubterraDarkus } from "./ability-cards/combination-triple";

export const AbilityCards: Record<string, abilityCardsType> = {
    // Pyrus

    [MurDeFeu.key]: MurDeFeu,
    [JetEnflamme.key]: JetEnflamme,
    [RetroAction.key]: RetroAction,
    [TourbillonDeFeu.key]: TourbillonDeFeu,
    [PyrusDarkus.key]: PyrusDarkus,
    [SubterraPyrus.key]: SubterraPyrus,

    // Aquos

    [MirageAquatique.key]: MirageAquatique,
    [BarrageDeau.key]: BarrageDeau,
    [BouclierAquos.key]: BouclierAquos,
    [PlongeeEnEauProfonde.key]: PlongeeEnEauProfonde,
    [AquosSubterra.key]: AquosSubterra,
    [AquosVentus.key]: AquosVentus,

    // Subterra

    [MagmaSupreme.key]: MagmaSupreme,
    [ChuteColossale.key]: ChuteColossale,
    [CopieConforme.key]: CopieConforme,
    [Obstruction.key]: Obstruction,
    [ForceDattraction.key]: ForceDattraction,
    [SubterraAquos.key]: SubterraAquos,
    [SubterraHaos.key]: SubterraHaos,

    // Haos

    [RapideHaos.key]: RapideHaos,
    [EclatSoudain.key]: EclatSoudain,
    [LumiereDivine.key]: LumiereDivine,
    [ContreMaitrise.key]: ContreMaitrise,
    [HaosImmobilisation.key]: HaosImmobilisation,
    [HaosDarkus.key]: HaosDarkus,
    [HaosVentus.key]: HaosVentus,

    // Darkus

    [CoupDeGrace.key]: CoupDeGrace,
    [EpicesMortelles.key]: EpicesMortelles,
    [BoublierFusion.key]: BoublierFusion,
    [VengeanceAlItalienne.key]: VengeanceAlItalienne,
    [PoivreDesCayenne.key]: PoivreDesCayenne,
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

    // Combination Triple
    [PyrusAquosHaos.key]: PyrusAquosHaos,
    [VentusSubterraDarkus.key]: VentusSubterraDarkus
}

export const AbilityCardsList: abilityCardsType[] = Object.values(AbilityCards) 