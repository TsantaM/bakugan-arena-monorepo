'use client'

import z from "zod"

export const SignInSchema = z.object({
    username : z.string(),
    password: z.string()
})