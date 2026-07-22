const { spawnSync } = require("node:child_process")
const path = require("node:path")

/*
Supported commands:

npm run db -- start
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
}

const action = process.argv[2]
const seedTarget = process.argv[3]

switch (action) {
	case "start":
		runCommand("docker", ["compose", "up", "-d"])
		waitForPostgres()
		break
	case "wait":
		waitForPostgres()
		break
	case "stop":
		runCommand("docker", ["compose", "down"])
		break
	case "nuke":
		runCommand("docker", ["compose", "down", "-v"])
		break
	case "status":
		runCommand("docker", ["ps", "--filter", "name=vicugna-postgres"])
		break
	case "generate":
		runCommand(nodeCommand, [drizzleScript, "generate"])
		break
	case "migrate":
		runCommand(nodeCommand, [drizzleScript, "migrate"])
		break
	case "studio":
		runCommand(nodeCommand, [drizzleScript, "studio"])
		break
	case "seed":
		runSeed(seedTarget)
		break
	default:
		console.error(
			"Unknown db action. Use: start, stop, status, generate, migrate, studio, seed",
		)
		process.exit(1)
}

function runSeed(target) {
	if (!target || !seedTargets[target]) {
		console.error("Unknown seed target. Use: regionals, seasons, users or asg")
		process.exit(1)
	}

	runCommand(npmCommand, ["run", "build:ts"])
	runCommand(nodeCommand, [seedTargets[target]])
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

function runCommand(command, args) {
	const result = spawnSync(command, args, {
		cwd: backendDir,
		stdio: "inherit",
	})

	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}
