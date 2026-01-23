'use server'

import prisma from "@/src/lib/prisma"
import { getUser } from "../getUserSession"

export const DeleteDeck = async (id: string) => {

    const user = await getUser()

    if (user) {
        await prisma.deck.delete({
            where: {
                id: id
            }
        })
    }
}