import { DATABASE_URL_ENV } from "@/env"
import * as schema from "@/server/db/schemas"
import { neon, Pool } from "@neondatabase/serverless"
import { config } from "dotenv"
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http"
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless"

config({ path: ".env.local" })

const sql = neon(DATABASE_URL_ENV)

export const db = drizzleHttp(sql, { schema })

const pool = new Pool({ connectionString: DATABASE_URL_ENV })
export const dbClient = drizzleServerless(pool)
