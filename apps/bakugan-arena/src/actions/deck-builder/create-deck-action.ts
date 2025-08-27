'use server'

import prisma from "@/src/lib/prisma"
import { getUser } from "../getUserSession"

export const CreateDeckAction = async () => {

    const user = await getUser()

    if (user) {

        const newDeck = await prisma.deck.create({
            data: {
                name: "New Deck",
                userId: user.id
            }
        })

        const id = newDeck.id
        return id
    }
} 