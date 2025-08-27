'use server'

import prisma from "@/src/lib/prisma"

export const GetAbilityCardsData = async ({ nom }: { nom?: string }) => {
    return await prisma.abilityCard.findMany({
        where: {
            ...(nom && { nom: { contains: nom, mode: 'insensitive' as const } }),
        },
        select: {
            id: true,
            nom: true,
            description: true,
            attributs: true,
            maxPerDeck: true
        }
    })
}

export type GetAbilityCardsDataType = Exclude<Awaited<ReturnType<typeof GetAbilityCardsData>>[number], undefined>
