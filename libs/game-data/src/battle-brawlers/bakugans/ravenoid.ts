import { bakuganType, gateCardType } from "../../type/game-data-types"
import { CaracterGateCardEffect } from '../../function/gate-card-effects/caracter-gate-card-function'

export const RavenoidPyrus: bakuganType = {
    key: 'ravenoid-pyrus',
    name: 'Ravenoid',
    attribut: 'Pyrus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`]
}

export const RavenoidVentus: bakuganType = {
    key: 'ravenoid-ventus',
    name: 'Ravenoid',
    attribut: 'Ventus',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`]
}

export const RavenoidHaos: bakuganType = {
    key: 'ravenoid-haos',
    name: 'Ravenoid',
    attribut: 'Haos',
    image: 'ravenoid',
    family: 'Ravenoid',
    powerLevel: 300,
    exclusiveAbilities: [`effaceur-d'ombre`]
}

export const RavenoidGateCard: gateCardType = {
    key: 'ravenoid-gate-card',
    name: 'Carte Personnage: Ravenoid',
    maxInDeck: 1,
    family: 'Ravenoid',
    description: `Lorsque cette carte est activée elle double le niveau de tous les Ravenoid présent sur elle`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot && s.portalCard?.key === 'ravenoid-gate-card')
        CaracterGateCardEffect({ slotOfGate: slotOfGate, family: 'Ravenoid' })

    },
}