import { type deckType } from "../type/type-index.js";

type UpdateDeckBakugansOptions = {
    deck: deckType
    bakugans: {key: string, userId: string}[]
    eliminate?: boolean // true si le bakugan doit être marqué éliminé
}


export function updateDeckBakugans({ deck, bakugans, eliminate = false }: UpdateDeckBakugansOptions) {
    if (!deck) return   

    deck.bakugans.forEach((b) => {
        if (!b || !b.bakuganData) return

        const match = bakugans.find(
            (bk) =>
                bk.key === b.bakuganData.key &&
                bk.userId === deck.userId // 🔥 CRUCIAL
        )

        if (!match) return

        b.bakuganData.onDomain = false
        if (eliminate) b.bakuganData.elimined = true
    })
}