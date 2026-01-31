//import { schema } from "@bakugan-arena/drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

import { schema } from "@bakugan-arena/drizzle-orm"
import { drizzle as drizzle_dev } from "drizzle-orm/node-postgres"
import pkg from "pg";

const sql = neon(process.env.DATABASE_URL!)
const prodDB = drizzle(sql, { schema })

const { Client } = pkg

const client = new Client({
    connectionString: process.env.DATABASE_URL_LOCAL
})

await client.connect()

const devDB = drizzle_dev(client, { schema })

let db: typeof prodDB | typeof devDB

if (process.env.NODE_ENV === "production") {
    db = prodDB
} else {
    db = devDB
}

export { db }