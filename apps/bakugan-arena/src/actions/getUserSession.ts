'use server'

import { headers } from "next/headers"
import { auth } from "../lib/auth"
import prisma from "../lib/prisma"

export const getUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return session?.user
}

export type UserType = Exclude<Awaited<ReturnType<typeof getUser>>, undefined>


export const getUserRole = async() => {
    const user = await getUser()

    if(user) {
        return await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                role: true
            }
        })
    }
}

export type RoleType = Exclude<Awaited<ReturnType<typeof getUserRole>>, undefined>
