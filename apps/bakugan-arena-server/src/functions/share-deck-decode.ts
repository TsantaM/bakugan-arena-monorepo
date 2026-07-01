import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, GateCardsList } from "@bakugan-arena/game-data"
import { decompressFromEncodedURIComponent } from "lz-string"

type SharedDeck = [
  number[],
  number[],
  number[],
  number[]
]

export type DecodedDeckType = {
  bakugans: string[]
  ability: string[]
  exclusiveAbilities: string[]
  gateCards: string[]
}

export function decodeDeckCode(code: string): DecodedDeckType | undefined {
  try {
    const json = decompressFromEncodedURIComponent(code)
    if (!json) return undefined

    const parsed = JSON.parse(json) as SharedDeck

    const deck: DecodedDeckType = {
      bakugans: parsed[0].map((i) => BakuganList[i]?.key).filter(Boolean) as string[],
      ability: parsed[1].map((i) => AbilityCardsList[i]?.key).filter(Boolean) as string[],
      exclusiveAbilities: parsed[2].map((i) => ExclusiveAbilitiesList[i]?.key).filter(Boolean) as string[],
      gateCards: parsed[3].map((i) => GateCardsList[i]?.key).filter(Boolean) as string[]
    }

    if (deck.bakugans.length === 0) return undefined

    return deck
  } catch {
    return undefined
  }
}
