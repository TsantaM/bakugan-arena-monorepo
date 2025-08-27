'use client'

import z from "zod"


export const editPasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(7, 'Veuillez entrer un Mot de passe plus long')
})