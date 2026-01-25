import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { username } from "better-auth/plugins/username";
import { db } from "./db";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg"
    }),

    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        username()
    ]
});