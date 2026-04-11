
import { exclusiveAbilitiesType } from "../index.js";
import { AileEnflamee } from "./exclusive-abilities/aile-enflammee.js";
import { AntiMuse } from "./exclusive-abilities/anti-muse.js";
import { BouclierFusion } from "./exclusive-abilities/bouclier-fusion.js";
import { DragonoidPlus } from "./exclusive-abilities/dragonoid-plus.js";
import { EffecteurdOmbre } from "./exclusive-abilities/effaceur-d-ombre.js";
import { FlareBlinder } from "./exclusive-abilities/flare-blinder.js";
import { ForceDattraction } from "./exclusive-abilities/force-d-attraction.js";
import { FurryOfWind } from "./exclusive-abilities/furry-of-wind.js";
import { GaucheGigantesque } from "./exclusive-abilities/gauche-gigantesque.js";
import { ChambreDeGravite } from "./exclusive-abilities/gravity-chamber.js";
import { ImpactMajeur } from "./exclusive-abilities/impact-majeur.js";
import { JavelotAquos } from "./exclusive-abilities/javelot-aquos.js";
import { LanceDeFeu } from "./exclusive-abilities/lance-de-feu.js";
import { LanceEclair } from "./exclusive-abilities/lance-eclair.js";
import { MachettesJumelles } from "./exclusive-abilities/machettes-jumelles.js";
import { MaitreDesProfondeurs } from "./exclusive-abilities/maitre-des-profondeurs.js";
import { Marionnette } from "./exclusive-abilities/marionnette.js";
import { MassueGigantesque } from "./exclusive-abilities/massue-gigantesque.js";
import { MegaFlareBlinder } from "./exclusive-abilities/mega-flare-blinder.js";
import { Obstruction } from "./exclusive-abilities/obstruction.js";
import { OmbreBleue } from "./exclusive-abilities/ombre-bleue.js";
import { PlexusSolaire } from "./exclusive-abilities/plexus-solaire.js";
import { RobotallionExecution } from "./exclusive-abilities/robotallion-execution.js";
import { SabreDeLaMort } from "./exclusive-abilities/sabre-de-la-mort.js";
import { SpiritHole } from "./exclusive-abilities/spirit-hole.js";
import { TempeteDePlume } from "./exclusive-abilities/tempete-de-plume.js";
import { TrappeDeSable } from "./exclusive-abilities/trappe-de-sable.js";
import { Tsunami } from "./exclusive-abilities/tsunami.js";
import { VentCinglant } from "./exclusive-abilities/vent-cinglant.js";
import { VentViolentDeNobelesseVerte } from "./exclusive-abilities/vent-violent.js";
import { VisageDeJoie } from "./exclusive-abilities/visage-de-joie.js";
import { VisageDeLaFureur } from "./exclusive-abilities/visage-de-la-fureur.js";
import { VisageDuChagrin } from "./exclusive-abilities/visage-du-chagrin.js";
// import { AileEnflamee, AntiMuse, BouclierFusion, ChambreDeGravite, DragonoidPlus, EffecteurdOmbre, FlareBlinder, ForceDattraction, FurryOfWind, GaucheGigantesque, ImpactMajeur, JavelotAquos, LanceDeFeu, LanceEclair, MachettesJumelles, MaitreDesProfondeurs, Marionnette, MassueGigantesque, MegaFlareBlinder, Obstruction, OmbreBleue, PlexusSolaire, RobotallionExecution, SabreDeLaMort, SpiritHole, TempeteDePlume, TrappeDeSable, Tsunami, VentCinglant, VentViolentDeNobelesseVerte, VisageDeJoie, VisageDeLaFureur, VisageDuChagrin } from "./exclusive-abilities/exclusive-abilities.js";

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
    [JavelotAquos.key]: JavelotAquos,
    [Tsunami.key]: Tsunami,
    [TrappeDeSable.key]: TrappeDeSable,
    [MaitreDesProfondeurs.key]: MaitreDesProfondeurs,
    // [DivisionHolographique.key]: DivisionHolographique,
    // [RegainSubit.key]: RegainSubit,
    // [CapeDeFeu.key]: CapeDeFeu,
    // [SouffleInfini.key]: SouffleInfini
    [ForceDattraction.key]: ForceDattraction,
    [FurryOfWind.key]: FurryOfWind,
    [FlareBlinder.key]: FlareBlinder,
    [MegaFlareBlinder.key]: MegaFlareBlinder,
    [Obstruction.key]: Obstruction,
    [BouclierFusion.key]: BouclierFusion,
    [SpiritHole.key]: SpiritHole
}

export const ExclusiveAbilitiesList: exclusiveAbilitiesType[] = Object.values(ExclusiveAbilities) 