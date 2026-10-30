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
	if (testArgs.includes("--list")) {
		const config = readE2eConfig()
		process.exitCode = runPlaywright(createE2eEnvironment(config))
		return
	}

	let e2eContext = null
	let testExitCode = 1

	try {
		e2eContext = await prepareE2eEnvironment()
		testExitCode = runPlaywright(e2eContext.environment)
	} finally {
		if (e2eContext) await removeE2eEnvironment(e2eContext)
	}

	process.exitCode = testExitCode
}

function createE2eEnvironment(config) {
	return {
		...process.env,
		NODE_ENV: "test",
		VICUGNA_DATABASE_URL: config.databaseUrl,
		VICUGNA_E2E_DATABASE_URL: config.databaseUrl,
		VICUGNA_SEED_USER_PASSWORD_FORMAT: "e2e-{name}-password",
	}
}

async function prepareE2eEnvironment() {
	const config = readE2eConfig()
	const environment = createE2eEnvironment(config)

	console.log(`Preparing isolated E2E database: ${config.databaseName}`)
	await recreateDatabase(config)

	try {
		runChecked(
			"database migrations",
			process.execPath,
			["scripts/db.cjs", "migrate"],
			environment,
		)
		runChecked("backend build", npmCommand, ["run", "build"], environment)
		seedExistingFixtures(environment)
		await seedAdmin(config)
		return { config, environment }
	} catch (error) {
		await dropDatabase(config)
		throw error
	}
}

async function removeE2eEnvironment({ config }) {
	console.log(`Removing isolated E2E database: ${config.databaseName}`)
	await dropDatabase(config)
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
	const passwordHash = await hashE2ePassword(config.adminPassword)
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

function hashE2ePassword(password) {
	return bcrypt.hash(password, 12)
}

function createE2eDatabaseClient(connectionString) {
	return new Client({ connectionString })
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

if (require.main === module) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error)
		process.exitCode = 1
	})
}

module.exports = {
	backendDir,
	createE2eDatabaseClient,
	hashE2ePassword,
	prepareE2eEnvironment,
	removeE2eEnvironment,
}
