const { spawnSync } = require("node:child_process")
const path = require("node:path")
const bcrypt = require("bcrypt")
const { config: loadEnv } = require("dotenv")
const { Client } = require("pg")

const backendDir = path.resolve(__dirname, "..")
const envPath = path.join(backendDir, ".env")
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"
const playwrightCli = path.join(
	path.dirname(require.resolve("@playwright/test/package.json")),
	"cli.js",
)
const testArgs = process.argv.slice(2)
const connectionTargetParameters = new Set([
	"database",
	"db",
	"dbname",
	"host",
	"hostaddr",
	"port",
	"service",
])

loadEnv({ path: envPath, quiet: true })

async function main() {
	const config = readE2eConfig()
	const testEnvironment = {
		...process.env,
		NODE_ENV: "test",
		VICUGNA_DATABASE_URL: config.databaseUrl,
		VICUGNA_E2E_DATABASE_URL: config.databaseUrl,
		VICUGNA_SEED_USER_PASSWORD_FORMAT: "e2e-{name}-password",
	}

	if (testArgs.includes("--list")) {
		process.exitCode = runPlaywright(testEnvironment)
		return
	}

	let databaseCreated = false
	let testExitCode = 1

	try {
		console.log(`Preparing isolated E2E database: ${config.databaseName}`)
		await recreateDatabase(config)
		databaseCreated = true
		runChecked(
			"database migrations",
			process.execPath,
			["scripts/db.cjs", "migrate"],
			testEnvironment,
		)
		runChecked(
			"backend build",
			npmCommand,
			["run", "build"],
			testEnvironment,
		)
		seedExistingFixtures(testEnvironment)
		await seedAdmin(config)
		testExitCode = runPlaywright(testEnvironment)
	} finally {
		if (databaseCreated) {
			console.log(
				`Removing isolated E2E database: ${config.databaseName}`,
			)
			await dropDatabase(config)
		}
	}

	process.exitCode = testExitCode
}

function readE2eConfig() {
	const databaseUrl = process.env.VICUGNA_E2E_DATABASE_URL?.trim()
	const adminEmail = process.env.E2E_ADMIN_EMAIL?.trim()
	const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim()

	if (!databaseUrl) {
		throw new Error("VICUGNA_E2E_DATABASE_URL is required")
	}

	if (!adminEmail || !adminPassword) {
		throw new Error("E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required")
	}

	const parsedUrl = parsePostgresUrl(databaseUrl)
	assertNoConnectionTargetParameters(parsedUrl, "VICUGNA_E2E_DATABASE_URL")

	if (normalizeHostname(parsedUrl.hostname) !== "localhost") {
		throw new Error(
			"Refusing E2E database access: only a local PostgreSQL server is allowed",
		)
	}

	const databaseName = getDatabaseName(parsedUrl)

	if (!/^[a-zA-Z0-9_]+_e2e$/.test(databaseName)) {
		throw new Error(
			"Refusing E2E database access: database name must end in _e2e",
		)
	}

	const developmentUrls = [
		["VICUGNA_DATABASE_URL", process.env.VICUGNA_DATABASE_URL?.trim()],
		[
			"VICUGNA_DEV_DATABASE_URL",
			process.env.VICUGNA_DEV_DATABASE_URL?.trim(),
		],
	]

	for (const [name, developmentUrl] of developmentUrls) {
		if (!developmentUrl) continue

		const parsedDevelopmentUrl = parsePostgresUrl(developmentUrl)
		assertNoConnectionTargetParameters(parsedDevelopmentUrl, name)

		if (isSameDatabase(parsedUrl, parsedDevelopmentUrl)) {
			throw new Error(
				`Refusing E2E database access: ${name} targets the E2E database`,
			)
		}
	}

	const maintenanceUrl = new URL(parsedUrl)
	maintenanceUrl.pathname = "/postgres"

	return {
		databaseUrl,
		databaseName,
		maintenanceUrl: maintenanceUrl.toString(),
		adminEmail,
		adminPassword,
	}
}

function parsePostgresUrl(value) {
	let parsedUrl

	try {
		parsedUrl = new URL(value)
	} catch {
		throw new Error("E2E database URL is not valid")
	}

	if (
		parsedUrl.protocol !== "postgres:" &&
		parsedUrl.protocol !== "postgresql:"
	) {
		throw new Error("E2E database URL must use PostgreSQL")
	}

	if (!parsedUrl.pathname || parsedUrl.pathname === "/") {
		throw new Error("E2E database URL must include a database name")
	}

	return parsedUrl
}

function isSameDatabase(left, right) {
	return (
		normalizeHostname(left.hostname) ===
			normalizeHostname(right.hostname) &&
		(left.port || "5432") === (right.port || "5432") &&
		getDatabaseName(left) === getDatabaseName(right)
	)
}

function getDatabaseName(parsedUrl) {
	return decodeURIComponent(parsedUrl.pathname.slice(1))
}

function assertNoConnectionTargetParameters(parsedUrl, variableName) {
	for (const parameter of parsedUrl.searchParams.keys()) {
		if (connectionTargetParameters.has(parameter)) {
			throw new Error(
				`Refusing E2E database access: ${variableName} cannot use the ${parameter} query parameter`,
			)
		}
	}
}

function normalizeHostname(hostname) {
	return ["localhost", "127.0.0.1", "[::1]"].includes(hostname)
		? "localhost"
		: hostname.toLowerCase()
}

async function recreateDatabase(config) {
	const client = new Client({ connectionString: config.maintenanceUrl })
	await client.connect()

	try {
		await client.query(
			`DROP DATABASE IF EXISTS ${quoteIdentifier(config.databaseName)} WITH (FORCE)`,
		)
		await client.query(
			`CREATE DATABASE ${quoteIdentifier(config.databaseName)}`,
		)
	} finally {
		await client.end()
	}
}

async function dropDatabase(config) {
	const client = new Client({ connectionString: config.maintenanceUrl })
	await client.connect()

	try {
		await client.query(
			`DROP DATABASE IF EXISTS ${quoteIdentifier(config.databaseName)} WITH (FORCE)`,
		)
	} finally {
		await client.end()
	}
}

function quoteIdentifier(value) {
	return `"${value}"`
}

function seedExistingFixtures(environment) {
	const seedFiles = [
		"dist/db/seeders/seed-seasons.js",
		"dist/db/seeders/seed-regionals.js",
		"dist/db/seeders/seed-users.js",
		"dist/db/seeders/seed-assignments.js",
		"dist/db/seeders/seed-e2e-monitoring.js",
	]

	for (const seedFile of seedFiles) {
		runChecked(
			`fixture ${seedFile}`,
			process.execPath,
			[seedFile],
			environment,
		)
	}
}

async function seedAdmin(config) {
	const client = new Client({ connectionString: config.databaseUrl })
	const passwordHash = await bcrypt.hash(config.adminPassword, 12)
	await client.connect()

	try {
		const existingUser = await client.query(
			"SELECT id FROM users WHERE email = $1",
			[config.adminEmail],
		)

		if (existingUser.rowCount) {
			throw new Error(
				"E2E_ADMIN_EMAIL must not match a regular seeded user",
			)
		}

		await client.query(
			`INSERT INTO users (
				id,
				first_name,
				paternal_last_name,
				maternal_last_name,
				phone_number,
				email,
				password_hash,
				role,
				is_active,
				avatar_seed
			) VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin', true, $8)`,
			[
				"user-e2e-admin",
				"Admin",
				"E2E",
				"Pruebas",
				"79999999",
				config.adminEmail,
				passwordHash,
				"vicugna-e2e-admin",
			],
		)
	} finally {
		await client.end()
	}
}

function runPlaywright(environment) {
	const result = spawnSync(
		process.execPath,
		[
			playwrightCli,
			"test",
			"--config",
			"e2e/playwright.config.ts",
			...testArgs,
		],
		{
			cwd: backendDir,
			env: environment,
			stdio: "inherit",
		},
	)

	if (result.error) {
		throw result.error
	}

	return result.status ?? 1
}

function runChecked(label, command, args, environment) {
	const result = spawnSync(command, args, {
		cwd: backendDir,
		env: environment,
		stdio: "inherit",
	})

	if (result.error) {
		throw result.error
	}

	if (result.status !== 0) {
		throw new Error(`${label} failed`)
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error)
	process.exitCode = 1
})
