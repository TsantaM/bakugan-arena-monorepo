import { GetUserDeckType } from '@/src/actions/deck-builder/get-deck-data'
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, GateCardsList } from '@bakugan-arena/game-data'
import { compressToEncodedURIComponent } from 'lz-string'

type SharedDeck = [
  number[], // bakugans
  number[], // abilities
  number[], // exclusive abilities
  number[]  // gate cards
]

function mapToIndex<T extends { key: string }>(
  list: T[],
  items: string[]
): number[] {
  return items
    .map(key => list.findIndex(el => el.key === key))
    .filter(index => index !== -1)
}

export function encodeDeck(deck: GetUserDeckType): string | null {
    // if no bakugans, consider the deck empty
    if (!deck.bakugans || deck.bakugans.length === 0) return null

  const compact: SharedDeck = [
    mapToIndex(BakuganList, deck.bakugans),
    mapToIndex(AbilityCardsList, deck.ability),
    mapToIndex(ExclusiveAbilitiesList, deck.exclusiveAbilities),
    mapToIndex(GateCardsList, deck.gateCards)
  ]

  const encoded = compressToEncodedURIComponent(JSON.stringify(compact))
  console.log(encoded)
  return encoded

}