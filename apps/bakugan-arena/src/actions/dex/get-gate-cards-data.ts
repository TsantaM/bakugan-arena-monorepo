'use server'

import prisma from "@/src/lib/prisma"

export const getGateCardsDate = async (nom?: string) => {
    return prisma.gateCards.findMany({
        where: {
            ...(nom && { nom: { contains: nom, mode: 'insensitive' as const } }),
        },
        select: {
            id: true,
            description: true,
            nom: true
        }
    })
}

export type getGateCardsDateType = Exclude<Awaited<ReturnType<typeof getGateCardsDate>>[number], undefined>
