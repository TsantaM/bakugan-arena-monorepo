
import { exclusiveAbilitiesType } from "../type/game-data-types";
import { AileEnflamee, AntiMuse, CapeDeFeu, ChambreDeGravite, DimmensionQuatre, DivisionHolographique, DragonoidPlus, EffecteurdOmbre, GaucheGigantesque, ImpactMajeur, JavelotAquos, LanceDeFeu, LanceEclair, MachettesJumelles, MaitreDesProfondeurs, Marionnette, MassueGigantesque, OmbreBleue, PlexusSolaire, RayonGamma, RegainSubit, RobotallionExecution, SabreDeLaMort, SouffleInfini, TempeteDePlume, TrappeDeSable, Tsunami, VentCinglant, VentViolentDeNobelesseVerte, VisageDeJoie, VisageDeLaFureur, VisageDuChagrin } from "./exclusive-abilities/exclusive-abilities";

export const ExclusiveAbilities: Record<string, exclusiveAbilitiesType> = {
    [OmbreBleue.key]: OmbreBleue,
    [DragonoidPlus.key]: DragonoidPlus,
    [SabreDeLaMort.key]: SabreDeLaMort,
    [ChambreDeGravite.key]: ChambreDeGravite,
    [VentViolentDeNobelesseVerte.key]: VentViolentDeNobelesseVerte,
    [ImpactMajeur.key]: ImpactMajeur,
    [AntiMuse.key]: AntiMuse,
    [VentCinglant.key]: VentCinglant,
    [AileEnflamee.key]: AileEnflamee,
    [VisageDeJoie.key]: VisageDeJoie,
    [VisageDuChagrin.key]: VisageDuChagrin,
    [VisageDeLaFureur.key]: VisageDeLaFureur,
    [MassueGigantesque.key]: MassueGigantesque,
    [GaucheGigantesque.key]: GaucheGigantesque,
    [TempeteDePlume.key]: TempeteDePlume,
    // [RayonGamma.key]: RayonGamma,
    // [DimmensionQuatre.key]: DimmensionQuatre,
    [Marionnette.key]: Marionnette,
    [LanceEclair.key]: LanceEclair,
    [MachettesJumelles.key]: MachettesJumelles,
    [RobotallionExecution.key]: RobotallionExecution,
    [PlexusSolaire.key]: PlexusSolaire,
    [EffecteurdOmbre.key]: EffecteurdOmbre,
    [LanceDeFeu.key]: LanceDeFeu,
    // [JavelotAquos.key]: JavelotAquos,
    // [Tsunami.key]: Tsunami,
    // [TrappeDeSable.key]: TrappeDeSable,
    [MaitreDesProfondeurs.key]: MaitreDesProfondeurs,
    // [DivisionHolographique.key]: DivisionHolographique,
    // [RegainSubit.key]: RegainSubit,
    // [CapeDeFeu.key]: CapeDeFeu,
    // [SouffleInfini.key]: SouffleInfini
}

export const ExclusiveAbilitiesList: exclusiveAbilitiesType[] = Object.values(ExclusiveAbilities) 