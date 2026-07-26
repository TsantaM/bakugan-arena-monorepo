import { forbidden, unauthorized } from "next/navigation"
import { headers } from "next/headers"
import { cache } from "react"
import { auth } from "../lib/auth"
import { db } from "../lib/db"

// -----------------------
// Récupérer l'utilisateur connecté (dédupliqué par request RSC)
// -----------------------
export const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session?.user
})

export type UserType = Exclude<Awaited<ReturnType<typeof getUser>>, undefined>

// -----------------------
// Récupérer le rôle de l'utilisateur
// -----------------------
export const getUserRole = cache(async () => {
  const currentUser = await getUser()

  if (!currentUser) return undefined

  const result = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, currentUser.id),
    columns: { role: true },
  })

  return result?.role
})

export type RoleType = Exclude<Awaited<ReturnType<typeof getUserRole>>, undefined>

// -----------------------
// Vérifier que l'utilisateur est admin
// -----------------------
export const requireAdmin = async () => {
  const user = await getUser()

  if (!user) {
    unauthorized()
  }

  const role = await getUserRole()

  if (role !== "ADMIN") {
    forbidden()
  }

  return user
}
