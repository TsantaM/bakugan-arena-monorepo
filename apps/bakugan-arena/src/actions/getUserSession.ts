'use server'

import { headers } from "next/headers"
import { auth } from "../lib/auth"
import { db } from "../lib/db"

// -----------------------
// Récupérer l'utilisateur connecté
// -----------------------
export const getUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session?.user
}

export type UserType = Exclude<Awaited<ReturnType<typeof getUser>>, undefined>

// -----------------------
// Récupérer le rôle de l'utilisateur
// -----------------------
export const getUserRole = async () => {
  const currentUser = await getUser()

  if (!currentUser) return undefined

  const result = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, currentUser.id),
    columns: { role: true }, // on ne récupère que le rôle
  })

  return result?.role
}

export type RoleType = Exclude<Awaited<ReturnType<typeof getUserRole>>, undefined>
