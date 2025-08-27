'use client'

import z from "zod";

export const SignUpSchema = z.object({
    username: z.string().min(1, 'Veuillez entrer votre nom'),
    displayUsername: z.string().min(1, 'Veuillez entrer le nom qui va apparaître sur votre profil'),
    email: z.email(),
    password: z.string().min(7, 'Veuillez entrer un Mot de passe plus long')
})