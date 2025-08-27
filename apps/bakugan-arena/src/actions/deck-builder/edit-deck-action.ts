'use server'

import { editDeckName_type } from "@/components/elements/deck-builder/edit-deck"
import { getUser } from "../getUserSession"
import prisma from "@/src/lib/prisma"
import { GetDeckData } from "./get-deck-data"
import { AbilityCardsList } from "@bakugan-arena/game-data"
import { BakuganList } from "@bakugan-arena/game-data"
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data"
import { GateCardsList } from "@bakugan-arena/game-data"

export const EditDeckNameAction = async ({ id, formData }: { id: string, formData: editDeckName_type }) => {

    const user = await getUser()

    if (user) {
        return await prisma.deck.update({
            where: {
                id: id,
                userId: user.id
            },
            data: {
                name: formData.nom
            }
        })
    }

}

export const AddBakuganToDeckAction = async ({ bakuganId, deckId }: { bakuganId: string, deckId: string }) => {
    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    if (user && deckData) {
        if (!deckData.bakugans.includes(bakuganId) && deckData.bakugans.length < 3) {
            return await prisma.deck.update({
                where: {
                    id: deckId,
                    userId: user.id
                },
                data: {
                    bakugans: {
                        push: bakuganId
                    }
                }
            })
        }

    }
}

export const RemoveBakuganInDeckAction = async ({ bakuganId, deckId }: { bakuganId: string, deckId: string }) => {
    const toRemove = BakuganList.find((b) => b.key === bakuganId)
    const deckData = await GetDeckData(deckId)
    const user = await getUser()
    const newList = deckData?.bakugans.filter((b) => b != bakuganId)
    const exclusiveAbilities = toRemove?.exclusiveAbilities
    if (user) {

        await prisma.deck.update({
            where: {
                id: deckId,
                userId: user.id
            },
            data: {
                bakugans: newList,
                exclusiveAbilities: deckData?.exclusiveAbilities.filter((c) => !exclusiveAbilities?.includes(c))
            }
        })

        const attributs = BakuganList.filter((b) => deckData?.bakugans.includes(b.key)).map((a) => a.attribut)
        console.log(attributs)
        const sameAttribut = attributs.filter((a) => a === toRemove?.attribut)
        const same = sameAttribut.length - 1
        console.log(sameAttribut)


        // Remove ability && gate cards with same attribut if same === 0

        if (same === 0) {
            const attribut = toRemove?.attribut

            const cardList = AbilityCardsList.filter((c) => deckData?.ability.includes(c.key))
            const abilities = cardList?.filter((c) => c.attribut != attribut).map((c) => c.key)

            const gateCards = GateCardsList.filter((c) => deckData?.gateCards.includes(c.key))
            const gates = gateCards.filter((c)=> c.attribut && c.attribut != attribut).map((c) => c.key)

            await prisma.deck.update({
                where: {
                    id: deckId,
                    userId: user.id
                },
                data: {
                    ability: abilities,
                    gateCards: gates
                }
            })
        }

    }

}

export const AddAbilityCardToDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {
    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    const numberOfExemplary = deckData?.ability.filter(c => c === cardId) ? deckData?.ability.filter(c => c === cardId).length : 0
    const maxPerDeck = AbilityCardsList.find((a) => a.key === cardId)?.maxInDeck

    if (user && deckData && deckData.ability.length < 6 && maxPerDeck) {
        if (maxPerDeck > numberOfExemplary) {
            return prisma.deck.update({
                where: {
                    id: deckId
                },
                data: {
                    ability: {
                        push: cardId
                    }
                }
            })
        }
    }

}

export const RemoveAbilityCardFromDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {

    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    if (user && deckData) {

        const index = deckData?.ability.indexOf(cardId)
        deckData?.ability.splice(index, 1)

        return prisma.deck.update({
            where: {
                id: deckId,
                userId: user.id
            },
            data: {
                ability: deckData?.ability
            }
        })
    }
}

export const AddExclusiveAbilityCardToDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {
    const deckData = await GetDeckData(deckId)
    const user = await getUser()


    const numberOfExemplary = deckData?.exclusiveAbilities.filter(c => c === cardId) ? deckData?.exclusiveAbilities.filter(c => c === cardId).length : 0
    const maxPerDeck = ExclusiveAbilitiesList.find((a) => a.key === cardId)?.maxInDeck

    if (user && maxPerDeck && deckData?.exclusiveAbilities && deckData.exclusiveAbilities.length < 3) {
        if (numberOfExemplary < maxPerDeck) {
            return prisma.deck.update({
                where: {
                    id: deckId,
                    userId: user.id
                },
                data: {
                    exclusiveAbilities: {
                        push: cardId
                    }
                }
            })
        }
    }

}

export const RemoveExclusiveAbilityCardFromDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {
    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    if (user && deckData) {

        const index = deckData?.exclusiveAbilities.indexOf(cardId)
        deckData?.exclusiveAbilities.splice(index, 1)

        return prisma.deck.update({
            where: {
                id: deckId,
                userId: user.id
            },
            data: {
                exclusiveAbilities: deckData.exclusiveAbilities
            }
        })
    }
}

export const AddGateCardToDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {
    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    const cardInDeck = deckData?.gateCards
    const exemplaries = cardInDeck ? cardInDeck?.filter((c) => c === cardId).length : 0
    const card = GateCardsList.find((c) => c.key === cardId)
    const maxPerDeck = card?.maxInDeck

    const attribut = BakuganList.filter((b) => deckData?.bakugans.includes(b.key)).map((a) => a.attribut)
    const compatibleAttribut = card?.attribut && attribut.includes(card?.attribut)

    if (user && cardInDeck && cardInDeck.length < 5 && maxPerDeck && deckData.bakugans.length > 0) {
        if (exemplaries < maxPerDeck) {
            if (compatibleAttribut || compatibleAttribut === undefined) {
                return prisma.deck.update({
                    where: {
                        id: deckId,
                        userId: user.id
                    },
                    data: {
                        gateCards: {
                            push: cardId
                        }
                    }
                })
            }
        }

    }
}

export const RemoveGateCardToDeck = async ({ cardId, deckId }: { cardId: string, deckId: string }) => {

    const deckData = await GetDeckData(deckId)
    const user = await getUser()

    if (user && deckData) {
        const index = deckData?.gateCards.indexOf(cardId)
        deckData?.gateCards.splice(index, 1)

        return prisma.deck.update({
            where: {
                id: deckId,
                userId: user.id
            },
            data: {
                gateCards: deckData.gateCards
            }
        })
    }
}
