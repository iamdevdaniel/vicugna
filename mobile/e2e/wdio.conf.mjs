import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"

try {
	process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)))
} catch (error) {
	if (error?.code !== "ENOENT") throw error
}

const deviceId = process.env.E2E_DEVICE_ID?.trim()
if (!deviceId) throw new Error("Missing E2E_DEVICE_ID in mobile/.env")

const artifactsDirectory = fileURLToPath(
	new URL("./artifacts", import.meta.url),
)
const happyPathSpec = fileURLToPath(
	new URL("./happy-path.mjs", import.meta.url),
)
const validationSpec = fileURLToPath(
	new URL("./validation.mjs", import.meta.url),
)

async function saveFailureScreenshot(test, failureType) {
	try {
		await mkdir(artifactsDirectory, { recursive: true })
		const name = `${test.parent} ${test.title} ${failureType}`
			.replaceAll(/[^a-z0-9]+/gi, "-")
			.replaceAll(/^-|-$/g, "")
			.toLowerCase()
		await browser.saveScreenshot(
			`${artifactsDirectory}/${name || "failed-test"}.png`,
		)
	} catch (error) {
		console.warn(
			"Could not save failure screenshot:",
			error instanceof Error ? error.message : error,
		)
	}
}

export const config = {
	runner: "local",
	hostname: "127.0.0.1",
	port: 4723,
	path: "/",
	logLevel: "error",
	waitforTimeout: 15_000,
	connectionRetryTimeout: 120_000,
	connectionRetryCount: 1,
	maxInstances: 1,
	specs: [],
	suites: {
		happy: [happyPathSpec],
		validation: [validationSpec],
	},
	capabilities: [
		{
			platformName: "Android",
			"appium:automationName": "UiAutomator2",
			"appium:deviceName": deviceId,
			"appium:udid": deviceId,
			"appium:appPackage": "com.maydanachi.vicugna",
			"appium:appActivity": ".MainActivity",
			"appium:noReset": true,
			"appium:dontStopAppOnReset": true,
			"appium:newCommandTimeout": 180,
		},
	],
	framework: "mocha",
	reporters: ["spec"],
	mochaOpts: {
		ui: "bdd",
		timeout: 600_000,
	},
	before: async () => {
		await browser.updateSettings({ waitForIdleTimeout: 0 })
	},
	afterTest: async (test, _context, { passed, skipped }) => {
		if (!passed && !skipped) await saveFailureScreenshot(test, "test")
	},
	afterHook: async (test, _context, { passed, skipped }, hookName) => {
		if (!passed && !skipped) await saveFailureScreenshot(test, hookName)
	},
}
