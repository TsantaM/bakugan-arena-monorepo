import { GetUserDeckType } from '@/src/actions/deck-builder/get-deck-data'
import { DecodedDeckType } from '@/src/types/share-deck-types'
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, GateCardsList } from '@bakugan-arena/game-data'
import { decompressFromEncodedURIComponent } from 'lz-string'

type SharedDeck = [
    number[],
    number[],
    number[],
    number[]
]

type DecodeDeckReturn = DecodedDeckType | "INVALID_CODE"

export function decodeDeck(code: string): DecodeDeckReturn {
    try {
        const json = decompressFromEncodedURIComponent(code)
        if (!json) return "INVALID_CODE"

        const parsed: SharedDeck = JSON.parse(json)

        const deck: DecodedDeckType = {
            bakugans: parsed[0].map(i => BakuganList[i]?.key).filter(Boolean),
            ability: parsed[1].map(i => AbilityCardsList[i]?.key).filter(Boolean),
            exclusiveAbilities: parsed[2].map(i => ExclusiveAbilitiesList[i]?.key).filter(Boolean),
            gateCards: parsed[3].map(i => GateCardsList[i]?.key).filter(Boolean)
        }

        if (!deck.bakugans || deck.bakugans.length === 0) return "INVALID_CODE"

        return deck

    } catch {
        return "INVALID_CODE"
    }
}