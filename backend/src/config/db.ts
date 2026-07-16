import { Pool, type QueryResult } from "pg"
import "dotenv/config"

const databaseUrl = process.env.VICUGNA_DATABASE_URL

if (!databaseUrl) {
	throw new Error("VICUGNA_DATABASE_URL is required")
}

export const pool = new Pool({
	connectionString: databaseUrl,
})

const DATABASE_CONNECTION_ERROR_CODES = new Set([
	"57P01",
	"57P02",
	"57P03",
	"ECONNREFUSED",
	"ECONNRESET",
	"ENOTFOUND",
	"ETIMEDOUT",
])

const originalPoolQuery = pool.query.bind(pool)

export function isDatabaseConnectionError(error: unknown) {
	if (!(error instanceof Error)) {
		return false
	}

	const code =
		"code" in error && typeof error.code === "string" ? error.code : null

	if (code && DATABASE_CONNECTION_ERROR_CODES.has(code)) {
		return true
	}

	return (
		error.message.includes("ECONNREFUSED") ||
		error.message.includes("Connection terminated unexpectedly") ||
		error.message.includes("the database system is starting up")
	)
}

async function retryPoolQueryOnce(...args: Parameters<typeof pool.query>) {
	try {
		return await originalPoolQuery(...args)
	} catch (error) {
		if (!isDatabaseConnectionError(error)) {
			throw error
		}

		await new Promise((resolve) => setTimeout(resolve, 300))

		return originalPoolQuery(...args)
	}
}

pool.query = retryPoolQueryOnce as typeof pool.query

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error", error)
})

export const db = {
	query: (text: string, params?: unknown[]): Promise<QueryResult> =>
		pool.query(text, params),
}
