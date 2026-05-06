
import { exclusiveAbilitiesType } from "../index.js";
import { AileEnflamee } from "./exclusive-abilities/aile-enflammee.js";
import { AmunRa } from "./exclusive-abilities/amun-ra.js";
import { AntiMuse } from "./exclusive-abilities/anti-muse.js";
import { BouclierFusion } from "./exclusive-abilities/bouclier-fusion.js";
import { ChaosOfDarkness } from "./exclusive-abilities/chaos-of-darkness.js";
import { DepthTornado } from "./exclusive-abilities/depht-tornado.js";
import { DimmensionQuatre } from "./exclusive-abilities/dimmension-quatre.js";
import { DivisionHolographique } from "./exclusive-abilities/division-holographique.js";
import { DragonoidPlus } from "./exclusive-abilities/dragonoid-plus.js";
import { EffecteurdOmbre } from "./exclusive-abilities/effaceur-d-ombre.js";
import { FlareBlinder } from "./exclusive-abilities/flare-blinder.js";
import { ForceDattraction } from "./exclusive-abilities/force-d-attraction.js";
import { FurryOfWind } from "./exclusive-abilities/furry-of-wind.js";
import { GaucheGigantesque } from "./exclusive-abilities/gauche-gigantesque.js";
import { ChambreDeGravite } from "./exclusive-abilities/gravity-chamber.js";
import { GardianField } from "./exclusive-abilities/guardian-field.js";
import { ImpactMajeur } from "./exclusive-abilities/impact-majeur.js";
import { JavelotAquos } from "./exclusive-abilities/javelot-aquos.js";
import { LanceDeFeu } from "./exclusive-abilities/lance-de-feu.js";
import { LanceEclair } from "./exclusive-abilities/lance-eclair.js";
import { LeapSting } from "./exclusive-abilities/leap-sting.js";
import { LifeDrew } from "./exclusive-abilities/life-drew.js";
import { MachettesJumelles } from "./exclusive-abilities/machettes-jumelles.js";
import { MaitreDesProfondeurs } from "./exclusive-abilities/maitre-des-profondeurs.js";
import { Marionnette } from "./exclusive-abilities/marionnette.js";
import { MassueGigantesque } from "./exclusive-abilities/massue-gigantesque.js";
import { MegaFlareBlinder } from "./exclusive-abilities/mega-flare-blinder.js";
import { NoiseSlap } from "./exclusive-abilities/noise-slap.js";
import { Obstruction } from "./exclusive-abilities/obstruction.js";
import { OmbreBleue } from "./exclusive-abilities/ombre-bleue.js";
import { PlexusSolaire } from "./exclusive-abilities/plexus-solaire.js";
import { RayonGamma } from "./exclusive-abilities/rayon-gamma.js";
import { ReaperOfTheChaos } from "./exclusive-abilities/reaper-of-the-chaos.js";
import { RobotallionExecution } from "./exclusive-abilities/robotallion-execution.js";
import { SabreDeLaMort } from "./exclusive-abilities/sabre-de-la-mort.js";
import { SlashZero } from "./exclusive-abilities/slash-zero.js";
import { SolarRay } from "./exclusive-abilities/solar-ray.js";
import { SpiritHole } from "./exclusive-abilities/spirit-hole.js";
import { SpitPointer } from "./exclusive-abilities/SpitPointer.js";
import { TempeteDePlume } from "./exclusive-abilities/tempete-de-plume.js";
import { TrappeDeSable } from "./exclusive-abilities/trappe-de-sable.js";
import { Tsunami } from "./exclusive-abilities/tsunami.js";
import { VentCinglant } from "./exclusive-abilities/vent-cinglant.js";
import { VentViolentDeNobelesseVerte } from "./exclusive-abilities/vent-violent.js";
import { VisageDeJoie } from "./exclusive-abilities/visage-de-joie.js";
import { VisageDeLaFureur } from "./exclusive-abilities/visage-de-la-fureur.js";
import { VisageDuChagrin } from "./exclusive-abilities/visage-du-chagrin.js";

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
    [RobotallionExecution.key]: RobotallionExecution,
    [SolarRay.key]: SolarRay,
    [RayonGamma.key]: RayonGamma,
    [DimmensionQuatre.key]: DimmensionQuatre,
    [ReaperOfTheChaos.key]: ReaperOfTheChaos,
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
    [DivisionHolographique.key]: DivisionHolographique,
    // [RegainSubit.key]: RegainSubit,
    // [CapeDeFeu.key]: CapeDeFeu,
    // [SouffleInfini.key]: SouffleInfini
    [ForceDattraction.key]: ForceDattraction,
    [FurryOfWind.key]: FurryOfWind,
    [FlareBlinder.key]: FlareBlinder,
    [MegaFlareBlinder.key]: MegaFlareBlinder,
    [Obstruction.key]: Obstruction,
    [BouclierFusion.key]: BouclierFusion,
    [SpiritHole.key]: SpiritHole,
    [DepthTornado.key]: DepthTornado,
    [GardianField.key]: GardianField,
    [LifeDrew.key]: LifeDrew,
    [SlashZero.key]: SlashZero,
    [SpitPointer.key]: SpitPointer,
    [NoiseSlap.key]: NoiseSlap,
    [LeapSting.key]: LeapSting,
    [ChaosOfDarkness.key]: ChaosOfDarkness,
    [AmunRa.key]: AmunRa
}

export const ExclusiveAbilitiesList: exclusiveAbilitiesType[] = Object.values(ExclusiveAbilities) 