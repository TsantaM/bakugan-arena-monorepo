'use server'

import { db } from "../lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq, not, like, and, sql } from "drizzle-orm"
import { getUser } from "./getUserSession"

const user = schema.user

export const FindUser = async ({ displayUserName }: { displayUserName: string }) => {
  const currentUser = await getUser()

  if (!displayUserName) return []

  // const condSql = `LOWER(${user.displayUsername}) LIKE ${displayUserName.toLowerCase()} + "%"`

  const conditions = [sql`LOWER(${user.displayUsername}) LIKE ${displayUserName.toLowerCase() + "%"}`]

  if (currentUser) {
    conditions.push(not(eq(user.id, currentUser.id)))
  }

  return await db.query.user.findMany({
    where: and(...conditions), // ✅ combine toutes les conditions
    columns: {
      displayUsername: true,
      id: true,
      image: true
    }
  })
}

export type findUserType = Exclude<Awaited<ReturnType<typeof FindUser>>, undefined>
export type findUserOneType = findUserType[number]
