import { FusionAerienne, FusionEnflammee, FusionLumineuse, FusionMarine, FusionTenebreuses, FusionTerrestre, PerilAquos, PerilDarkus, PerilHaos, PerilPyrus, PerilSubterra, PerilVentus, ReacteurAquos, ReacteurDarkus, ReacteurHaos, ReacteurPyrus, ReacteurSubterra, ReacteurVentus } from "./gate-card/gate-card-elementary";
import { Echange, MineFantome, SuperPyrus } from "./gate-card/gate-card-trap";
import { Armistice, BoucEmissaire, QuatuorDeCombat, Rechargement, RetourDAssenceur, TripleCombat } from "./gate-card/gate-card-command";
import { gateCardType } from "../type/game-data-types";

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


    // Commandement

    [Rechargement.key]: Rechargement,
    [TripleCombat.key]: TripleCombat,
    [QuatuorDeCombat.key]: QuatuorDeCombat,
    [RetourDAssenceur.key]: RetourDAssenceur,
    [BoucEmissaire.key]: BoucEmissaire,
    [Armistice.key]: Armistice

}


export const GateCardsList: gateCardType[] = Object.values(GateCards) 