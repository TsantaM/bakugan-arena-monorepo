'use server'

import prisma from "@bakugan-arena/prisma"
import { getUser } from "../getUserSession"

export const GetDeckData = async (id: string) => {
    const user = await getUser()

    if(user) {
        return await prisma.deck.findFirst({
            where: {
                id: id,
                userId: user.id
            },
            select: {
                id: true,
                name: true,
                bakugans: true,
                exclusiveAbilities: true,
                ability: true,
                gateCards: true
            }
        })
    }
}

export type GetDeckDataType = Exclude<Awaited<ReturnType<typeof GetDeckData>>, undefined>

export const GetUserDecks = async () => {
    const user = await getUser()

    if(user) {
        return await prisma.deck.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                bakugans: true,
                name: true,
                gateCards: true,
                ability: true,
                exclusiveAbilities: true
            }
        })
    }
}

export type GetUserDecksType = Exclude<Awaited<ReturnType<typeof GetUserDecks>>, undefined>
export type GetUserDeckType = GetUserDecksType[number]