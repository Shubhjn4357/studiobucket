import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"

// Create client
const client = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Create DB instance
export const db = drizzle(client, { schema })

// Export schema for convenience
export * from "./schema"
