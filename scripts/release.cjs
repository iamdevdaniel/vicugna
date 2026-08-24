const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const target = process.argv[2];
const bump = process.argv[3] ?? "patch";
const validTargets = new Set(["backend", "mobile"]);
const validBumps = new Set(["patch", "minor", "major"]);
const mobileApkBumps = new Set(["minor", "major"]);
const mobileArtifactName = "vicugna.apk";
const activeMobileBuildStatuses = new Set([
	"NEW",
	"IN_QUEUE",
	"IN_PROGRESS",
	"PENDING_CANCEL",
]);

if (!validTargets.has(target) || !validBumps.has(bump)) {
	console.error(
		"Usage: npm run release:backend -- [patch|minor|major]\n" +
			"       npm run release:mobile -- [patch|minor|major]",
	);
	process.exit(1);
}

function run(command, args, { capture = false, cwd = rootDir } = {}) {
	const result = spawnSync(command, args, {
		cwd,
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

function commandSucceeds(command, args, { cwd = rootDir } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		stdio: "ignore",
	});

	return result.status === 0;
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
	const currentVersion = packageJson.version;
	const [currentMajor, currentMinor] = currentVersion.split(".").map(Number);
	const currentRuntimeVersion = `${currentMajor}.${currentMinor}`;

	if (
		appJson.expo.version !== currentVersion ||
		appJson.expo.runtimeVersion !== currentRuntimeVersion
	) {
		throw new Error("Mobile version files are out of sync");
	}

	if (!Number.isInteger(appJson.expo.android.versionCode)) {
		throw new Error("Mobile Android versionCode must be an integer");
	}

	const version = bumpVersion(currentVersion);
	const [major, minor] = version.split(".").map(Number);

	packageJson.version = version;
	appJson.expo.version = version;
	packageLock.packages.mobile.version = version;

	if (mobileApkBumps.has(bump)) {
		appJson.expo.runtimeVersion = `${major}.${minor}`;
		appJson.expo.android.versionCode += 1;
	}

	writeJson("mobile/package.json", packageJson);
	writeJson("mobile/app.json", appJson);
	writeJson("package-lock.json", packageLock);

	return {
		version,
		files: ["mobile/package.json", "mobile/app.json", "package-lock.json"],
	};
}

function getMobileReleaseBump() {
	const previousPackage = JSON.parse(
		gitOutput("show", "HEAD^:mobile/package.json"),
	);
	const currentVersion = getCurrentVersion().split(".").map(Number);
	const previousVersion = previousPackage.version.split(".").map(Number);

	if (currentVersion[0] !== previousVersion[0]) {
		return "major";
	}

	if (currentVersion[1] !== previousVersion[1]) {
		return "minor";
	}

	return "patch";
}

function assertGitHubReleaseAccess() {
	if (!commandSucceeds("gh", ["--version"])) {
		throw new Error(
			"GitHub CLI is required for mobile APK releases; install gh and run: gh auth login",
		);
	}

	if (!commandSucceeds("gh", ["auth", "status"])) {
		throw new Error("GitHub CLI is not authenticated; run: gh auth login");
	}
}

function getGitHubRelease(tag) {
	const result = spawnSync("gh", ["release", "view", tag, "--json", "assets"], {
		cwd: rootDir,
		encoding: "utf8",
		stdio: "pipe",
	});

	if (result.status !== 0) {
		const errorMessage =
			(result.stderr ?? "").trim() || (result.stdout ?? "").trim();

		if (errorMessage === "release not found") {
			return null;
		}

		throw new Error(
			`Failed to check GitHub release ${tag}: ${errorMessage || "unknown error"}`,
		);
	}

	return JSON.parse(result.stdout);
}

function listMobileBuilds() {
	const mobileDir = path.join(rootDir, "mobile");
	const output = run(
		"npx",
		[
			"--yes",
			"eas-cli@21.8.0",
			"build:list",
			"--platform",
			"android",
			"--build-profile",
			"production",
			"--git-commit-hash",
			gitOutput("rev-parse", "HEAD"),
			"--limit",
			"10",
			"--json",
			"--non-interactive",
		],
		{ capture: true, cwd: mobileDir },
	);
	return JSON.parse(output);
}

function findCompletedMobileBuild(builds = listMobileBuilds()) {
	return builds.find((build) => build.status === "FINISHED") ?? null;
}

function findActiveMobileBuild(builds) {
	return (
		builds.find((build) => activeMobileBuildStatuses.has(build.status)) ?? null
	);
}

function downloadMobileArtifact() {
	const mobileDir = path.join(rootDir, "mobile");
	const build = findCompletedMobileBuild();

	if (!build) {
		throw new Error(
			"No completed production APK exists for this release commit",
		);
	}
	const output = run(
		"npx",
		[
			"--yes",
			"eas-cli@21.8.0",
			"build:download",
			"--build-id",
			build.id,
			"--json",
		],
		{ capture: true, cwd: mobileDir },
	);
	const artifact = JSON.parse(output);

	if (!artifact.path) {
		throw new Error("EAS did not return the downloaded APK path");
	}

	return artifact.path;
}

function publishMobileGitHubRelease(version, tag) {
	assertGitHubReleaseAccess();
	const existingRelease = getGitHubRelease(tag);

	if (
		existingRelease?.assets.some((asset) => asset.name === mobileArtifactName)
	) {
		return;
	}

	const artifactPath = downloadMobileArtifact();
	const artifactDir = fs.mkdtempSync(
		path.join(os.tmpdir(), "vicugna-release-"),
	);
	const releaseArtifactPath = path.join(artifactDir, mobileArtifactName);
	fs.copyFileSync(artifactPath, releaseArtifactPath);

	try {
		if (existingRelease) {
			run("gh", ["release", "upload", tag, releaseArtifactPath, "--clobber"]);
			return;
		}

		run("gh", [
			"release",
			"create",
			tag,
			releaseArtifactPath,
			"--verify-tag",
			"--latest",
			"--title",
			`Vicugna App v${version}`,
			"--notes",
			`Aplicación Android Vicugna v${version}`,
		]);
	} finally {
		fs.rmSync(artifactDir, { recursive: true, force: true });
		fs.rmSync(artifactPath, { force: true });
	}
}

function publishMobileArtifact(version, releaseBump) {
	const mobileDir = path.join(rootDir, "mobile");
	const easArgs = ["--yes", "eas-cli@21.8.0"];

	if (mobileApkBumps.has(releaseBump)) {
		const builds = listMobileBuilds();

		if (findCompletedMobileBuild(builds)) {
			return;
		}

		const activeBuild = findActiveMobileBuild(builds);

		if (activeBuild) {
			throw new Error(
				`EAS build ${activeBuild.id} is still ${activeBuild.status}; wait for it to finish and rerun the release command`,
			);
		}

		run(
			"npx",
			[
				...easArgs,
				"build",
				"--platform",
				"android",
				"--profile",
				"production",
				"--non-interactive",
			],
			{ cwd: mobileDir },
		);
		return;
	}

	run(
		"npx",
		[
			...easArgs,
			"update",
			"--channel",
			"production",
			"--environment",
			"production",
			"--platform",
			"android",
			"--message",
			`Mobile v${version}`,
			"--non-interactive",
		],
		{ cwd: mobileDir },
	);
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
	if (target === "mobile" && Number(process.versions.node.split(".")[0]) < 20) {
		throw new Error(
			"Mobile releases require Node 20 or newer; run: nvm use 22",
		);
	}

	if (gitOutput("branch", "--show-current") !== "dev") {
		throw new Error("Releases must be run from the dev branch");
	}

	assertCleanWorktree();
	run("git", ["fetch", "--tags", "origin", "main", "dev"]);

	const completedRelease = getCompletedRelease();

	if (completedRelease) {
		if (target === "mobile" && mobileApkBumps.has(getMobileReleaseBump())) {
			publishMobileGitHubRelease(
				completedRelease.version,
				completedRelease.tag,
			);
		}
		console.log(`Already released ${target} v${completedRelease.version}`);
		process.exit(0);
	}

	const pendingRelease = getPendingRelease();

	if (pendingRelease) {
		runChecks();
		const releaseBump = target === "mobile" ? getMobileReleaseBump() : null;
		if (target === "mobile" && mobileApkBumps.has(releaseBump)) {
			assertGitHubReleaseAccess();
		}
		if (target === "mobile" && !tagExists(pendingRelease.tag)) {
			publishMobileArtifact(pendingRelease.version, releaseBump);
		}
		ensureReleaseTag(pendingRelease.tag, pendingRelease.version);
		publishRelease(pendingRelease.tag);
		if (target === "mobile" && mobileApkBumps.has(releaseBump)) {
			publishMobileGitHubRelease(pendingRelease.version, pendingRelease.tag);
		}
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
	if (target === "mobile" && mobileApkBumps.has(bump)) {
		assertGitHubReleaseAccess();
	}

	const release =
		target === "backend" ? updateBackendVersion() : updateMobileVersion();

	run("git", ["add", ...release.files]);
	run("git", ["commit", "-m", `chore(${target}): release v${release.version}`]);
	if (target === "mobile") {
		publishMobileArtifact(release.version, bump);
	}
	ensureReleaseTag(tag, release.version);
	publishRelease(tag);
	if (target === "mobile" && mobileApkBumps.has(bump)) {
		publishMobileGitHubRelease(release.version, tag);
	}

	console.log(`Released ${target} v${release.version}`);
} catch (error) {
	console.error(`Release failed: ${error.message}`);
	console.error(
		"Fix the problem and rerun the same release command; it will not bump again",
	);
	process.exit(1);
}
