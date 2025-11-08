import { type deckType } from "../type/room-types";

type UpdateDeckBakugansOptions = {
    deck: deckType
    keys: string[]
    eliminate?: boolean // true si le bakugan doit être marqué éliminé
}

export function updateDeckBakugans({ deck, keys, eliminate = false }: UpdateDeckBakugansOptions) {
    if (!deck || !Array.isArray(deck.bakugans)) return

    deck.bakugans
        .filter((b) => b?.bakuganData && keys.includes(b.bakuganData.key))
        .forEach((b) => {
            if (!b || !b.bakuganData) return
            b.bakuganData.onDomain = false
            if (eliminate) b.bakuganData.elimined = true
        })
}
