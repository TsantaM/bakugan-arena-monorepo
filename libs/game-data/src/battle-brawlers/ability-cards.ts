import { abilityCardsType } from "../index.js";
import { AquosSubterra, AquosVentus, BoublierFusion, CombatAerien, CoupDeGrace, DarkusAquos, DarkusPyrus, EclatSoudain, ForceDattraction, HaosDarkus, HaosImmobilisation, HaosVentus, JetEnflamme, MagmaSupreme, MirageAquatique, MurDeFeu, Obstruction, PyrusAquosHaos, PyrusDarkus, RetourDair, RetroAction, SouffleTout, SubterraAquos, SubterraHaos, SubterraPyrus, TornadeChaosTotal, TornadeExtreme, TourbillonDeFeu, VengeanceAlItalienne, VentusHaos, VentusPyrus, VentusSubterraDarkus } from "./ability-cards/index.js";

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
    // [BarrageDeau.key]: BarrageDeau,
    // [BouclierAquos.key]: BouclierAquos,
    // [PlongeeEnEauProfonde.key]: PlongeeEnEauProfonde,
    [AquosSubterra.key]: AquosSubterra,
    [AquosVentus.key]: AquosVentus,

    // Subterra

    [MagmaSupreme.key]: MagmaSupreme,
    // [ChuteColossale.key]: ChuteColossale,
    // [CopieConforme.key]: CopieConforme,
    [Obstruction.key]: Obstruction,
    [ForceDattraction.key]: ForceDattraction,
    [SubterraAquos.key]: SubterraAquos,
    [SubterraHaos.key]: SubterraHaos,

    // Haos

    // [RapideHaos.key]: RapideHaos,
    [EclatSoudain.key]: EclatSoudain,
    // [LumiereDivine.key]: LumiereDivine,
    // [ContreMaitrise.key]: ContreMaitrise,
    [HaosImmobilisation.key]: HaosImmobilisation,
    [HaosDarkus.key]: HaosDarkus,
    [HaosVentus.key]: HaosVentus,

    // Darkus

    [CoupDeGrace.key]: CoupDeGrace,
    // [EpicesMortelles.key]: EpicesMortelles,
    [BoublierFusion.key]: BoublierFusion,
    [VengeanceAlItalienne.key]: VengeanceAlItalienne,
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

    // Combination Triple
    [PyrusAquosHaos.key]: PyrusAquosHaos,
    [VentusSubterraDarkus.key]: VentusSubterraDarkus
}

export const AbilityCardsList: abilityCardsType[] = Object.values(AbilityCards) 