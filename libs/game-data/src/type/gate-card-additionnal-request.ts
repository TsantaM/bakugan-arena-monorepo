import { bakuganInDeck, bakuganOnSlot } from "./room-types.js"

export type gateCardAdditionalRequest = {
    type: 'CHOOSE_BAKUGAN',
    data: bakuganInDeck[]
    
} | {
    type: 'CHOOSE_ABILITY',
    data: { cards: string[], bakugans: bakuganOnSlot[] }[]
}



export type gateCardAdditionalRequestResolution = {
    type: 'CHOOSE_BAKUGAN',
    data: bakuganInDeck[]
} | {
    type : 'CHOOSE_ABILITY',
    data: {
        card: string,
        bakugan: bakuganOnSlot
    }
}