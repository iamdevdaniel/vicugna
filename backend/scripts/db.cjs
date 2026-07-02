const { spawnSync } = require("node:child_process")
const path = require("node:path")

/*
Supported commands:

npm run db -- start
npm run db -- stop
npm run db -- status
npm run db -- generate
npm run db -- migrate
npm run db -- studio
npm run db -- seed season
npm run db -- seed regionals
*/

const backendDir = path.resolve(__dirname, "..")
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx"
const nodeCommand = process.platform === "win32" ? "node.exe" : "node"

const seedTargets = {
	regionals: "dist/db/seeders/seed-regionals.js",
	season: "dist/db/seeders/seed-season.js",
}

const action = process.argv[2]
const seedTarget = process.argv[3]

switch (action) {
	case "start":
		runCommand("docker", ["compose", "up", "-d"])
		break
	case "stop":
		runCommand("docker", ["compose", "down"])
		break
	case "status":
		runCommand("docker", ["ps", "--filter", "name=vicugna-postgres"])
		break
	case "generate":
		runCommand(npxCommand, ["drizzle-kit", "generate"])
		break
	case "migrate":
		runCommand(npxCommand, ["drizzle-kit", "migrate"])
		break
	case "studio":
		runCommand(npxCommand, ["drizzle-kit", "studio"])
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
		console.error("Unknown seed target. Use: regionals or season")
		process.exit(1)
	}

	runCommand(npmCommand, ["run", "build:ts"])
	runCommand(nodeCommand, [seedTargets[target]])
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
