import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const ElCondorHaos: bakuganType = {
    key: 'el-condor-haos',
    name: 'El Condor',
    attribut: 'Haos',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire'],
    powerLevel: 310
}

export const ElCondorVentus: bakuganType = {
    key: 'el-condor-ventus',
    name: 'El Condor',
    attribut: 'Ventus',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire', 'souffle-infini'],
    powerLevel: 310
}

export const ElCondorSubterra: bakuganType = {
    key: 'el-condor-subterra',
    name: 'El Condor',
    attribut: 'Subterra',
    family: 'El Condor',
    image: 'el-condor',
    exclusiveAbilities: ['plexus-solaire'],
    powerLevel: 310
}

export const ElCondorGateCard: gateCardType = {
    key: 'el-condor-gate-card',
    name: 'Carte Personnage: El Condor',
    maxInDeck: 1,
    description: `Lorsque cette carte est activée elle double le niveau de tous les El Condor présent sur elle`,
    family: 'El Condor',
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'el-condor-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'El Condor' })

    },
}