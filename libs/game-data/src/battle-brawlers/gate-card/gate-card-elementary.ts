import { gateCardType } from "../../type/game-data-types"

export const ReacteurPyrus: gateCardType = {
    key: 'reacteur-pyrus',
    name: 'Reacteur Pyrus',
    attribut: 'Pyrus',
    description: 'Ajoute 100 G à tous les bakugans Pyrus sur la carte',
    maxInDeck: 3
}

export const ReacteurHaos: gateCardType = {
    key: 'reacteur-haos',
    name: 'Reacteur Haos',
    attribut: 'Haos',
    description: 'Ajoute 100 G à tous les bakugans Haos sur la carte',
    maxInDeck: 3
}

export const ReacteurVentus: gateCardType = {
    key: 'reacteur-ventus',
    name: 'Reacteur Ventus',
    attribut: 'Ventus',
    description: 'Ajoute 100 G à tous les bakugans Ventus sur la carte',
    maxInDeck: 3
}

export const ReacteurAquos: gateCardType = {
    key: 'reacteur-aquos',
    name: 'Reacteur Aquos',
    attribut: 'Aquos',
    description: 'Ajoute 100 G à tous les bakugans Aquos sur la carte',
    maxInDeck: 3
}

export const ReacteurSubterra: gateCardType = {
    key: 'reacteur-subterra',
    name: 'Reacteur Subterra',
    attribut: 'Subterra',
    description: 'Ajoute 100 G à tous les bakugans Subterra sur la carte',
    maxInDeck: 3
}

export const ReacteurDarkus: gateCardType = {
    key: 'reacteur-darkus',
    name: 'Reacteur darkus',
    attribut: 'Darkus',
    description: 'Ajoute 100 G à tous les bakugans Darkus sur la carte',
    maxInDeck: 3
}


// Carte Péril

export const PerilPyrus: gateCardType = {
    key: 'peril-pyrus',
    name: 'Péril Pyrus',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Pyrus`
}

export const PerilAquos: gateCardType = {
    key: 'peril-aquos',
    name: 'Péril Aquos',
    attribut: 'Aquos',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Aquos`
}

export const PerilVentus: gateCardType = {
    key: 'peril-ventus',
    name: 'Péril Ventus',
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Ventus`
}

export const PerilSubterra: gateCardType = {
    key: 'peril-subterra',
    name: 'Péril Subterra',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Subterra`
}

export const PerilHaos: gateCardType = {
    key: 'peril-haos',
    name: 'Péril Haos',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Haos`
}

export const PerilDarkus: gateCardType = {
    key: 'peril-darkus',
    name: 'Péril Darkus',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents sur cette carte en Darkus`
}

// Fusions

export const FusionMarine: gateCardType = {
    key: 'fusion-marine',
    name: 'Fusion Marine',
    attribut: 'Aquos',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Aquos sauf les Bakugans Subterra`
}

export const FusionAerienne: gateCardType = {
    key: 'fusion-aerienne',
    name: 'Fusion Aérienne',
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Ventus sauf les Bakugans Haos`
}

export const FusionTenebreuses: gateCardType = {
    key: 'fusion-tenebreuse',
    name: 'Fusion Ténébreuse',
    attribut: 'Darkus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Darkus sauf les Bakugans Pyrus`
}

export const FusionTerrestre: gateCardType = {
    key: 'fusion-terrestre',
    name: 'Fusion Terrestre',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Subterra sauf les Bakugans Aquos`
}

export const FusionLumineuse: gateCardType = {
    key: 'fusion-lumineuse',
    name: 'Fusion Lumineuse',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Haos sauf les Bakugans Ventus`
}

export const FusionEnflammee: gateCardType = {
    key: 'fusion-enflammee',
    name: 'Fusion Enflammée',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Transforme l'attribut de tous les Bakugans présents en Pyrus sauf les Bakugans Darkus`
}