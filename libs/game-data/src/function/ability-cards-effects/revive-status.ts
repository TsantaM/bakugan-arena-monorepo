import type { bakuganInDeck } from "../../type/room-types.js"

/**
 * Un bakugan banni (Pacte Sanglant) est retire definitivement du jeu : aucune
 * carte de reanimation (Renaissance, Engourdissement, Lumiere Divine, Fleche du
 * Sagittaire…) ne peut le ramener sur le terrain.
 */
export function canBeRevived(bakugan: bakuganInDeck | undefined | null): boolean {
    if (!bakugan) return false
    return bakugan.bakuganData.banished !== true
}
