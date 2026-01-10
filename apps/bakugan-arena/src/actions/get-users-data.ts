'use server'


import prisma from "@bakugan-arena/prisma"
import { getUser } from "./getUserSession"


export const FindUser = async ({ displayUserName }: { displayUserName: string }) => {
    const user = await getUser()

    if(displayUserName === '') return []

    return await prisma.user.findMany({
        where: {
            displayUsername: {
                startsWith: displayUserName,
            },
            id: {
                not: user ? user.id : undefined
            }
        },
        select: {
            displayUsername: true,
            id: true
        }
    })

}

export type findUserType = Exclude<Awaited<ReturnType<typeof FindUser>>, undefined>
export type findUserOneType = findUserType[number]