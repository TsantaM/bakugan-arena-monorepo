'use server'

import { editDeckName_type } from "@/components/elements/deck-builder/edit-deck"
import { getUser } from "../getUserSession"
import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq, and } from "drizzle-orm"
import { GetDeckData } from "./get-deck-data"
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, GateCardsList } from "@bakugan-arena/game-data"

const deck = schema.deck

export const EditDeckNameAction = async ({
    id,
    formData,
}: {
    id: string
    formData: editDeckName_type
}) => {
    const currentUser = await getUser()
    if (!currentUser) return undefined

    const updated = await db
        .update(deck)
        .set({ name: formData.nom })
        .where(and(eq(deck.id, id), eq(deck.userId, currentUser.id)))
        .returning({ id: deck.id, name: deck.name }) // récupère le nom mis à jour

    return updated[0] // retourne l'objet mis à jour
}

export const AddBakuganToDeckAction = async ({
    bakuganId,
    deckId,
}: {
    bakuganId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)

    if (!currentUser || !deckData) return undefined

    // Vérifier la ban list
    const banList = BakuganList.filter((b) => deckData.bakugans.includes(b.key))
        .map((b) => b.banList)
        .flat()

    if (
        !deckData.bakugans.includes(bakuganId) &&
        deckData.bakugans.length < 3 &&
        !banList.includes(bakuganId)
    ) {
        // Créer le nouveau tableau bakugans
        const newBakugans = [...deckData.bakugans, bakuganId]

        // Mettre à jour le deck
        const updated = await db
            .update(deck)
            .set({ bakugans: newBakugans })
            .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
            .returning({ bakugans: deck.bakugans, id: deck.id })

        return updated[0]
    }

    return undefined
}

export const RemoveBakuganInDeckAction = async ({
    bakuganId,
    deckId,
}: {
    bakuganId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    const toRemove = BakuganList.find((b) => b.key === bakuganId)
    if (!toRemove) return undefined

    // 1️⃣ Supprimer le bakugan et ses exclusiveAbilities
    const newBakugans = deckData.bakugans.filter((b) => b !== bakuganId)
    const newExclusiveAbilities = deckData.exclusiveAbilities.filter(
        (c) => !toRemove.exclusiveAbilities?.includes(c)
    )

    await db
        .update(deck)
        .set({
            bakugans: newBakugans,
            exclusiveAbilities: newExclusiveAbilities,
        })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))

    // 2️⃣ Vérifier les attributs restants
    const remainingAttributs = BakuganList.filter((b) => newBakugans.includes(b.key)).map(
        (b) => b.attribut
    )
    const sameAttributCount = remainingAttributs.filter((a) => a === toRemove.attribut).length

    // 3️⃣ Si plus aucun Bakugan du même attribut, supprimer abilities et gate cards correspondantes
    if (sameAttributCount === 0) {
        const abilities = AbilityCardsList.filter(
            (c) => deckData.ability.includes(c.key) && c.attribut !== toRemove.attribut
        ).map((c) => c.key)

        const gateCards = GateCardsList.filter(
            (c) => deckData.gateCards.includes(c.key) && c.attribut !== toRemove.attribut
        ).map((c) => c.key)

        await db
            .update(deck)
            .set({
                ability: abilities,
                gateCards: gateCards,
            })
            .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
    }
}

export const AddAbilityCardToDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    // Nombre d'exemplaires déjà présents
    const currentCount = deckData.ability.filter((c) => c === cardId).length
    const maxPerDeck = AbilityCardsList.find((a) => a.key === cardId)?.maxInDeck ?? 0

    // Limites : max 6 cartes dans le deck et maxParCarte
    if (deckData.ability.length >= 6 || currentCount >= maxPerDeck) return undefined

    // Nouveau tableau ability
    const newAbility = [...deckData.ability, cardId]

    const updated = await db
        .update(deck)
        .set({ ability: newAbility })
        .where(eq(deck.id, deckId))
        .returning({ ability: deck.ability, id: deck.id })

    return updated[0]
}

export const RemoveAbilityCardFromDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    // Supprimer seulement **une occurrence** de la carte
    const newAbility = [...deckData.ability]
    const index = newAbility.indexOf(cardId)
    if (index !== -1) {
        newAbility.splice(index, 1)
    }

    const updated = await db
        .update(deck)
        .set({ ability: newAbility })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
        .returning({ ability: deck.ability, id: deck.id })

    return updated[0]
}

export const AddExclusiveAbilityCardToDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    const currentCount = deckData.exclusiveAbilities.filter((c) => c === cardId).length
    const maxPerDeck = ExclusiveAbilitiesList.find((a) => a.key === cardId)?.maxInDeck ?? 0

    // Vérifie limites
    if (deckData.exclusiveAbilities.length >= 3 || currentCount >= maxPerDeck) return undefined

    // Nouveau tableau avec la carte ajoutée
    const newExclusiveAbilities = [...deckData.exclusiveAbilities, cardId]

    const updated = await db
        .update(deck)
        .set({ exclusiveAbilities: newExclusiveAbilities })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
        .returning({ exclusiveAbilities: deck.exclusiveAbilities, id: deck.id })

    return updated[0]
}

export const RemoveExclusiveAbilityCardFromDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    // Supprimer une seule occurrence
    const newExclusiveAbilities = [...deckData.exclusiveAbilities]
    const index = newExclusiveAbilities.indexOf(cardId)
    if (index !== -1) {
        newExclusiveAbilities.splice(index, 1)
    }

    const updated = await db
        .update(deck)
        .set({ exclusiveAbilities: newExclusiveAbilities })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
        .returning({ exclusiveAbilities: deck.exclusiveAbilities, id: deck.id })

    return updated[0]
}

export const AddGateCardToDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    const cardInDeck = deckData.gateCards
    const currentCount = cardInDeck.filter((c) => c === cardId).length
    const card = GateCardsList.find((c) => c.key === cardId)
    if (!card) return undefined

    const maxPerDeck = card.maxInDeck ?? 0

    // Vérifier compatibilité attribut
    const bakuganAttributes = BakuganList.filter((b) => deckData.bakugans.includes(b.key)).map(
        (b) => b.attribut
    )
    const compatibleAttribute = card.attribut ? bakuganAttributes.includes(card.attribut) : true

    if (
        cardInDeck.length >= 5 ||
        currentCount >= maxPerDeck ||
        deckData.bakugans.length === 0 ||
        !compatibleAttribute
    )
        return undefined

    const newGateCards = [...deckData.gateCards, cardId]

    const updated = await db
        .update(deck)
        .set({ gateCards: newGateCards })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
        .returning({ gateCards: deck.gateCards, id: deck.id })

    return updated[0]
}

export const RemoveGateCardFromDeck = async ({
    cardId,
    deckId,
}: {
    cardId: string
    deckId: string
}) => {
    const currentUser = await getUser()
    const deckData = await GetDeckData(deckId)
    if (!currentUser || !deckData) return undefined

    // Supprimer une seule occurrence
    const newGateCards = [...deckData.gateCards]
    const index = newGateCards.indexOf(cardId)
    if (index !== -1) {
        newGateCards.splice(index, 1)
    }

    const updated = await db
        .update(deck)
        .set({ gateCards: newGateCards })
        .where(and(eq(deck.id, deckId), eq(deck.userId, currentUser.id)))
        .returning({ gateCards: deck.gateCards, id: deck.id })

    return updated[0]
}
