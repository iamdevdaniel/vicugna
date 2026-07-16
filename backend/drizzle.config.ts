import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const databaseUrl = process.env.VICUGNA_DATABASE_URL

if (!databaseUrl) {
	throw new Error("VICUGNA_DATABASE_URL is required")
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
})
