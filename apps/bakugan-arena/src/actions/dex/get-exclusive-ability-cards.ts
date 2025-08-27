'use server'

import prisma from "@/src/lib/prisma"

export const GetExclusivesAbiltyCardsData = async({nom} : {nom?: string}) => {
    return prisma.exclusivesAbilityCards.findMany({
        where: {
            ...(nom && { nom: { contains: nom, mode: 'insensitive' as const } }),
        },

        select: {
            id: true,
            nom: true,
            description: true,
            maxPerDeck: true,
            bakugan: {
                select: {
                    id: true,
                    nom: true,
                    attribut: true
                }
            }
        }
    })
}

export type GetExclusiveAbilityCardsDataType = Exclude<Awaited<ReturnType<typeof GetExclusivesAbiltyCardsData>>[number], undefined>
