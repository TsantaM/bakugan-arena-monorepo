import type { Config } from "drizzle-kit";

export default {
  schema: "./dist/schema.js",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config;