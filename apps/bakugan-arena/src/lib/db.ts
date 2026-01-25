import { schema } from "@bakugan-arena/drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

//import * as schema from "@bakugan-arena/drizzle-orm"
//import { drizzle } from "drizzle-orm/node-postgres"
//import pkg from "pg";

//const { Client } = pkg

//const client = new Client({
//  connectionString: process.env.DATABASE_URL_LOCAL
//})

//await client.connect()

//export const db = drizzle(client, { schema })
