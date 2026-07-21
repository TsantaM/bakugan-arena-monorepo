'use client'

import z from "zod"

export function createEditPasswordSchema(passwordMin: string) {
    return z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(7, passwordMin)
    })
}

export type editPasswordForm_type = z.infer<ReturnType<typeof createEditPasswordSchema>>
