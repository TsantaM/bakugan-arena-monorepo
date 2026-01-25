import type { Config } from "drizzle-kit";

export default {
  schema: "../../libs/drizzle-orm/dist/schema.js",
  dialect: "postgresql",
  out: "../../libs/drizzle-orm/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config;