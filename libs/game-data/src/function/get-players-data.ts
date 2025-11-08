import { type deckType, type portalSlotsTypeElement } from "../type/room-types";

type getPlayerDecksAndBakugansProps = {
    slot: portalSlotsTypeElement,
    decksState: deckType[],
    players: {
    userId: string;
    usable_gates: number;
    usable_abilitys: number;
}[]
}

export function getPlayerDecksAndBakugans({slot, decksState, players} : getPlayerDecksAndBakugansProps) {
  const [p1, p2] = players
  const player1Bakugans = slot.bakugans.filter(b => b.userId === p1.userId)
  const player2Bakugans = slot.bakugans.filter(b => b.userId === p2.userId)
  const p1Deck = decksState.find(d => d.userId === p1.userId)
  const p2Deck = decksState.find(d => d.userId === p2.userId)
  return { player1Bakugans, player2Bakugans, p1Deck, p2Deck }
}