import { JetEnflamme, MurDeFeu, RetroAction, TourbillonDeFeu } from "./ability-cards/pyrus";
import { BarrageDeau, BouclierAquos, MirageAquatique, PlongeeEnEauProfonde } from "./ability-cards/aquos";
import { ChuteColossale, CopieConforme, ForceDattraction, MagmaSupreme, Obstruction } from "./ability-cards/subterra";
import { ContreMaitrise, EclatSoudain, HaosImmobilisation, LumiereDivine, RapideHaos } from "./ability-cards/haos";
import { BoublierFusion, CoupDeGrace, EpicesMortelles, PoivreDesCayenne, VengeanceAlItalienne } from "./ability-cards/darkus";
import { CombatAerien, RetourDair, SouffleTout, TornadeChaosTotal, TornadeExtreme } from "./ability-cards/ventus";
import { abilityCardsType } from "../type/game-data-types";

export const AbilityCards: Record<string, abilityCardsType> = {
    // Pyrus

    [MurDeFeu.key]: MurDeFeu,
    [JetEnflamme.key]: JetEnflamme,
    [RetroAction.key]: RetroAction,
    [TourbillonDeFeu.key]: TourbillonDeFeu,

    // Aquos

    [MirageAquatique.key]: MirageAquatique,
    [BarrageDeau.key]: BarrageDeau,
    [BouclierAquos.key]: BouclierAquos,
    [PlongeeEnEauProfonde.key]: PlongeeEnEauProfonde,


    // Subterra

    [MagmaSupreme.key]: MagmaSupreme,
    [ChuteColossale.key]: ChuteColossale,
    [CopieConforme.key]: CopieConforme,
    [Obstruction.key]: Obstruction,
    [ForceDattraction.key]: ForceDattraction,

    // Haos

    [RapideHaos.key]: RapideHaos,
    [EclatSoudain.key]: EclatSoudain,
    [LumiereDivine.key]: LumiereDivine,
    [ContreMaitrise.key]: ContreMaitrise,
    [HaosImmobilisation.key]: HaosImmobilisation,

    // Darkus

    [CoupDeGrace.key]: CoupDeGrace,
    [EpicesMortelles.key]: EpicesMortelles,
    [BoublierFusion.key]: BoublierFusion,
    [VengeanceAlItalienne.key]: VengeanceAlItalienne,
    [PoivreDesCayenne.key]: PoivreDesCayenne,

    // Ventus

    [CombatAerien.key]: CombatAerien,
    [TornadeChaosTotal.key]: TornadeChaosTotal,
    [SouffleTout.key]: SouffleTout,
    [RetourDair.key]: RetourDair,
    [TornadeExtreme.key]: TornadeExtreme
}

export const AbilityCardsList: abilityCardsType[] = Object.values(AbilityCards) 