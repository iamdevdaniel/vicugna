import { pool } from "@config"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

export const db = drizzle(pool, { schema })
