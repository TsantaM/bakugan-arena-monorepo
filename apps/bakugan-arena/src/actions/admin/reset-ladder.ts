'use server'

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { requireAdmin } from "../getUserSession"
import { DEFAULT_ELO } from "./constants"

const user = schema.user

export async function resetLadder() {
    await requireAdmin()

    const result = await db
        .update(user)
        .set({ elo: DEFAULT_ELO })
        .returning({ id: user.id })

    return { resetCount: result.length }
}
