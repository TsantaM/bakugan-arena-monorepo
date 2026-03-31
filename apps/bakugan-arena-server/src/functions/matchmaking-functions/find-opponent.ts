import { waitingListElements } from "../../sockets/search-opponent"

const BASE_RANGE = 50
const EXPANSION_PER_SEC = 5

export function findOpponent(player: waitingListElements, list: waitingListElements[]) {
    let bestMatch: waitingListElements | null = null
    let bestDiff = Infinity

    const now = Date.now()
    const waitTime = (now - player.joinedAtt) / 1000

    const allowedRange = BASE_RANGE + waitTime * EXPANSION_PER_SEC

    for (const opponent of list) {
        if (opponent.userId === player.userId) continue
        if (opponent.ranked !== player.ranked) continue

        const eloDiff = Math.abs(opponent.elo - player.elo)

        if (eloDiff <= allowedRange && eloDiff < bestDiff) {
            bestDiff = eloDiff
            bestMatch = opponent
        }
    }

    return bestMatch
}