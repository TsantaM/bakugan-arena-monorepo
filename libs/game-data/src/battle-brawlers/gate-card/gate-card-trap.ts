import { gateCardType } from "../../type/game-data-types";

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Fantôme',
    maxInDeck: 1,
    description: `Lorsque deux Bakugans se retrouvent sur cette carte ils sont tous les deux éliminés peu importe à qui ils appartiennent`
}

export const Echange: gateCardType = {
    key: 'echange',
    name: 'Echange',
    maxInDeck: 1,
    description: `Tout Bakugan ayant un niveau de puissance supérieur à 450 G perd automatiquement`
}

export const SuperPyrus: gateCardType = {
    key: 'super-pyrus',
    name: 'Super Pyrus',
    maxInDeck: 1,
    description: `Echange les niveau de puissance des bakugans au combat. Si elle n'est pas activée par le propriétaire, elle s'active automatiquement à la fin du combat.`
}