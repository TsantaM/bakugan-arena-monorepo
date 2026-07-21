'use client'

import z from "zod";

export function createSignUpSchema(messages: {
    usernameRequired: string
    displayUsernameRequired: string
    passwordMin: string
}) {
    return z.object({
        username: z.string().min(1, messages.usernameRequired),
        displayUsername: z.string().min(1, messages.displayUsernameRequired),
        email: z.email(),
        password: z.string().min(7, messages.passwordMin)
    })
}

export type signUpForm_type = z.infer<ReturnType<typeof createSignUpSchema>>
