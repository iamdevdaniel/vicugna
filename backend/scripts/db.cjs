const { spawnSync } = require("node:child_process")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const { parse: parseEnv } = require("dotenv")

/*
Supported commands:

npm run db -- start
npm run db -- respawn
npm run db -- wait
npm run db -- stop
npm run db -- nuke
npm run db -- status
npm run db -- generate
npm run db -- migrate
npm run db -- studio
npm run db -- seed seasons
npm run db -- seed regionals
npm run db -- seed users
npm run db -- seed asg
npm run db -- seed asg-reset
*/

const backendDir = path.resolve(__dirname, "..")
const repoDir = path.resolve(backendDir, "..")
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"
const nodeCommand = process.platform === "win32" ? "node.exe" : "node"
const drizzleScript = path.join(repoDir, "node_modules", "drizzle-kit", "bin.cjs")

const seedTargets = {
	regionals: "dist/db/seeders/seed-regionals.js",
	seasons: "dist/db/seeders/seed-seasons.js",
	users: "dist/db/seeders/seed-users.js",
	asg: "dist/db/seeders/seed-assignments.js",
	"asg-reset": "dist/db/seeders/reset-assignments-sync.js",
}
const respawnSeedTargets = ["seasons", "regionals", "users", "asg"]

const action = process.argv[2]
const seedTarget = process.argv[3]

switch (action) {
	case "start":
		startDatabase()
		break
	case "respawn":
		respawnDatabase()
		break
	case "wait":
		waitForPostgres()
		break
	case "stop":
		runCommandQuiet("docker", ["compose", "down"])
		console.log("Postgres stopped")
		break
	case "nuke":
		runCommandQuiet("docker", ["compose", "down", "-v"])
		console.log("Local database deleted")
		break
	case "status":
		runCommand("docker", ["ps", "--filter", "name=vicugna-postgres"])
		break
	case "generate":
		runCommand(nodeCommand, [drizzleScript, "generate"])
		break
	case "migrate":
		migrateDatabase()
		break
	case "studio":
		runCommand(nodeCommand, [drizzleScript, "studio"])
		break
	case "seed":
		runSeed(seedTarget)
		break
	default:
		console.error(
			"Unknown db action. Use: start, respawn, wait, stop, nuke, status, generate, migrate, studio or seed",
		)
		process.exit(1)
}

function startDatabase() {
	runCommandQuiet("docker", ["compose", "up", "-d"])
	waitForPostgres()
}

function respawnDatabase() {
	const developmentDatabaseEnvironment = getDevelopmentDatabaseEnvironment()
	startDatabase()
	migrateDatabase(developmentDatabaseEnvironment)
	buildBackend()

	for (const target of respawnSeedTargets) {
		runSeedTarget(target, developmentDatabaseEnvironment)
	}

	console.log("Database respawn complete")
}

function getDevelopmentDatabaseEnvironment() {
	const envPath = path.join(backendDir, ".env")
	const databaseUrl = parseEnv(
		readFileSync(envPath),
	).VICUGNA_DEV_DATABASE_URL?.trim()

	if (!databaseUrl) {
		console.error("VICUGNA_DEV_DATABASE_URL is required for database respawn")
		process.exit(1)
	}

	return { ...process.env, VICUGNA_DATABASE_URL: databaseUrl }
}

function migrateDatabase(environment = process.env) {
	runCommandQuiet(nodeCommand, [drizzleScript, "migrate"], environment)
	console.log("Migrations applied")
}

function buildBackend() {
	runCommandQuiet(npmCommand, ["run", "build:ts"])
}

function runSeed(target) {
	if (!target || !seedTargets[target]) {
		console.error(
			"Unknown seed target. Use: regionals, seasons, users, asg or asg-reset",
		)
		process.exit(1)
	}

	buildBackend()
	runSeedTarget(target)
}

function runSeedTarget(target, environment = process.env) {
	runCommand(nodeCommand, [seedTargets[target]], environment)
}

function waitForPostgres() {
	const timeoutMs = 30_000
	const startedAt = Date.now()

	while (Date.now() - startedAt < timeoutMs) {
		const result = spawnSync(
			"docker",
			[
				"exec",
				"vicugna-postgres",
				"pg_isready",
				"-U",
				"vicugna",
				"-d",
				"vicugna",
			],
			{
				cwd: backendDir,
				stdio: "ignore",
			},
		)

		if (result.status === 0) {
			console.log("Postgres is ready")
			return
		}

		sleep(1000)
	}

	console.error("Postgres did not become ready in time")
	process.exit(1)
}

function sleep(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function runCommand(command, args, environment = process.env) {
	const result = spawnSync(command, args, {
		cwd: backendDir,
		env: environment,
		stdio: "inherit",
	})

	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}

function runCommandQuiet(command, args, environment = process.env) {
	const result = spawnSync(command, args, {
		cwd: backendDir,
		encoding: "utf8",
		env: environment,
		maxBuffer: 10 * 1024 * 1024,
	})

	if (result.status !== 0) {
		if (result.stdout) process.stderr.write(result.stdout)
		if (result.stderr) process.stderr.write(result.stderr)
		if (result.error) console.error(result.error)
		process.exit(result.status ?? 1)
	}
}
