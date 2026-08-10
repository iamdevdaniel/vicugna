const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const target = process.argv[2];
const bump = process.argv[3] ?? "patch";
const validTargets = new Set(["backend", "mobile"]);
const validBumps = new Set(["patch", "minor", "major"]);

if (!validTargets.has(target) || !validBumps.has(bump)) {
	console.error(
		"Usage: npm run release:backend -- [patch|minor|major]\n" +
			"       npm run release:mobile -- [patch|minor|major]",
	);
	process.exit(1);
}

function run(command, args, { capture = false } = {}) {
	const result = spawnSync(command, args, {
		cwd: rootDir,
		encoding: "utf8",
		stdio: capture ? "pipe" : "inherit",
	});

	if (result.status !== 0) {
		if (capture && result.stderr) {
			console.error(result.stderr.trim());
		}

		throw new Error(`Command failed: ${command} ${args.join(" ")}`);
	}

	return capture ? result.stdout.trim() : "";
}

function gitOutput(...args) {
	return run("git", args, { capture: true });
}

function assertCleanWorktree() {
	if (gitOutput("status", "--porcelain")) {
		throw new Error("Commit or stash your changes before releasing");
	}
}

function readJson(relativePath) {
	return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
	fs.writeFileSync(
		path.join(rootDir, relativePath),
		`${JSON.stringify(value, null, 2)}\n`,
	);
}

function bumpVersion(version) {
	const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

	if (!match) {
		throw new Error(`Unsupported version: ${version}`);
	}

	let major = Number(match[1]);
	let minor = Number(match[2]);
	let patch = Number(match[3]);

	if (bump === "major") {
		major += 1;
		minor = 0;
		patch = 0;
	} else if (bump === "minor") {
		minor += 1;
		patch = 0;
	} else {
		patch += 1;
	}

	return `${major}.${minor}.${patch}`;
}

function tagExists(tag) {
	const result = spawnSync(
		"git",
		["rev-parse", "--verify", `refs/tags/${tag}`],
		{
			cwd: rootDir,
			stdio: "ignore",
		},
	);

	return result.status === 0;
}

function tagPointsToHead(tag) {
	return (
		tagExists(tag) &&
		gitOutput("rev-list", "-n", "1", tag) === gitOutput("rev-parse", "HEAD")
	);
}

function gitIsAncestor(ancestor, descendant) {
	const result = spawnSync(
		"git",
		["merge-base", "--is-ancestor", ancestor, descendant],
		{
			cwd: rootDir,
			stdio: "ignore",
		},
	);

	return result.status === 0;
}

function getCurrentVersion() {
	return readJson(`${target}/package.json`).version;
}

function getReleaseAtHead() {
	const version = getCurrentVersion();
	const tag = `${target}-v${version}`;
	const expectedMessage = `chore(${target}): release v${version}`;

	if (gitOutput("log", "-1", "--format=%s") === expectedMessage) {
		return { version, tag };
	}

	return null;
}

function getCompletedRelease() {
	const release = getReleaseAtHead();

	if (!release || !tagPointsToHead(release.tag)) {
		return null;
	}

	const head = gitOutput("rev-parse", "HEAD");
	const requiredRemoteRefs = ["origin/dev"];

	if (target === "backend") {
		requiredRemoteRefs.push("origin/main");
	}

	if (requiredRemoteRefs.every((ref) => gitOutput("rev-parse", ref) === head)) {
		return release;
	}

	return null;
}

function getPendingRelease() {
	const release = getReleaseAtHead();

	if (release && gitIsAncestor("origin/dev", "HEAD")) {
		return release;
	}

	return null;
}

function ensureReleaseTag(tag, version) {
	if (tagExists(tag)) {
		if (!tagPointsToHead(tag)) {
			throw new Error(`Tag points to another commit: ${tag}`);
		}

		return;
	}

	run("git", ["tag", "-a", tag, "-m", `${target} v${version}`]);
}

function updateBackendVersion() {
	const packageJson = readJson("backend/package.json");
	const packageLock = readJson("package-lock.json");
	const version = bumpVersion(packageJson.version);

	packageJson.version = version;
	packageLock.packages.backend.version = version;

	writeJson("backend/package.json", packageJson);
	writeJson("package-lock.json", packageLock);

	return {
		version,
		files: ["backend/package.json", "package-lock.json"],
	};
}

function updateMobileVersion() {
	const packageJson = readJson("mobile/package.json");
	const appJson = readJson("mobile/app.json");
	const packageLock = readJson("package-lock.json");
	const gradlePath = path.join(rootDir, "mobile/android/app/build.gradle");
	const gradle = fs.readFileSync(gradlePath, "utf8");
	const currentVersion = packageJson.version;

	if (
		appJson.expo.version !== currentVersion ||
		!gradle.includes(`versionName "${currentVersion}"`)
	) {
		throw new Error("Mobile version files are out of sync");
	}

	const versionCodeMatch = /versionCode\s+(\d+)/.exec(gradle);

	if (!versionCodeMatch) {
		throw new Error("Android versionCode was not found");
	}

	const gradleVersionCode = Number(versionCodeMatch[1]);
	const expoVersionCode = appJson.expo.android?.versionCode;

	if (expoVersionCode !== undefined && expoVersionCode !== gradleVersionCode) {
		throw new Error("Mobile Android versionCode files are out of sync");
	}

	const version = bumpVersion(currentVersion);
	const versionCode = gradleVersionCode + 1;

	packageJson.version = version;
	appJson.expo.version = version;
	appJson.expo.android.versionCode = versionCode;
	packageLock.packages.mobile.version = version;

	writeJson("mobile/package.json", packageJson);
	writeJson("mobile/app.json", appJson);
	writeJson("package-lock.json", packageLock);
	fs.writeFileSync(
		gradlePath,
		gradle
			.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
			.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`),
	);

	return {
		version,
		files: [
			"mobile/package.json",
			"mobile/app.json",
			"mobile/android/app/build.gradle",
			"package-lock.json",
		],
	};
}

function runChecks() {
	if (target === "backend") {
		run("npm", ["run", "tscheck", "--workspace=backend"]);
		run("npm", ["run", "build", "--workspace=backend"]);
		return;
	}

	run("npm", ["run", "tscheck", "--workspace=mobile"]);
}

function publishRelease(tag) {
	const refs = [
		"--atomic",
		"origin",
		"HEAD:refs/heads/dev",
		`refs/tags/${tag}`,
	];

	if (target === "backend") {
		refs.splice(3, 0, "HEAD:refs/heads/main");
	}

	run("git", ["push", ...refs]);
}

try {
	if (gitOutput("branch", "--show-current") !== "dev") {
		throw new Error("Releases must be run from the dev branch");
	}

	assertCleanWorktree();
	run("git", ["fetch", "--tags", "origin", "main", "dev"]);

	const completedRelease = getCompletedRelease();

	if (completedRelease) {
		console.log(`Already released ${target} v${completedRelease.version}`);
		process.exit(0);
	}

	const pendingRelease = getPendingRelease();

	if (pendingRelease) {
		runChecks();
		ensureReleaseTag(pendingRelease.tag, pendingRelease.version);
		publishRelease(pendingRelease.tag);
		console.log(`Released ${target} v${pendingRelease.version}`);
		process.exit(0);
	}

	run("git", ["merge", "--ff-only", "origin/dev"]);
	assertCleanWorktree();

	if (target === "backend") {
		run("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"]);
	}

	runChecks();
	assertCleanWorktree();

	const version = bumpVersion(getCurrentVersion());
	const tag = `${target}-v${version}`;

	if (tagExists(tag)) {
		throw new Error(`Tag already exists: ${tag}`);
	}

	const release =
		target === "backend" ? updateBackendVersion() : updateMobileVersion();

	run("git", ["add", ...release.files]);
	run("git", ["commit", "-m", `chore(${target}): release v${release.version}`]);
	ensureReleaseTag(tag, release.version);
	publishRelease(tag);

	console.log(`Released ${target} v${release.version}`);
} catch (error) {
	console.error(`Release failed: ${error.message}`);
	console.error(
		"Fix the problem and rerun the same release command; it will not bump again",
	);
	process.exit(1);
}
