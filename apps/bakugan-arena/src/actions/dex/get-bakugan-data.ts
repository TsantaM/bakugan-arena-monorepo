'use server'

import prisma from "@/src/lib/prisma"
import { AttributType } from "@/src/types/attributs"

export const GetBakugansData = async ({ nom, attribut }: { nom?: string, attribut?: AttributType }) => {
    return await prisma.bakugan.findMany({
        where: {
            ...(nom && { nom: { contains: nom, mode: 'insensitive' as const } }),
            ...(attribut && { attribut: attribut }),
        },
        select: {
            id: true,
            image: true,
            nom: true,
            attribut: true,
        },
        orderBy: {
            nom: 'asc'
        }
    })
}

export type GetBakugansDataType = Exclude<Awaited<ReturnType<typeof GetBakugansData>>[number], undefined>

export const BakuganDexData = async (id: string) => {
    const bakugan = await prisma.bakugan.findUnique({
        where: {
            id: id
        },
        select: {
            image: true,
            nom: true,
            attribut: true,
            niveauDePuissance: true,
            ExclusivesAbilityCards: {
                select: {
                    nom: true,
                    description: true,
                    maxPerDeck: true
                }
            }
        }
    })

    const abilities = await prisma.abilityCard.findMany({
        where: {
            attributs: bakugan?.attribut
        },
        select: {
            nom: true,
            description: true,
            maxPerDeck: true,
            attributs: true
        }
    })

    return {
        bakugan,
        abilities
    }
}

export type BakuganDexDataType = Exclude<Awaited<ReturnType<typeof BakuganDexData>>, undefined>
