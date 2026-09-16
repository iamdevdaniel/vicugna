const path = require("node:path")

try {
	process.loadEnvFile(path.resolve(__dirname, "../.env"))
} catch (error) {
	if (error?.code !== "ENOENT") throw error
}

const deviceId = process.env.E2E_DEVICE_ID?.trim()
if (!deviceId) throw new Error("Missing E2E_DEVICE_ID in mobile/.env")
const expoServerUrl =
	process.env.E2E_EXPO_URL?.trim() || "http://127.0.0.1:8081"
const metroPort = Number(new URL(expoServerUrl).port || 80)

/** @type {Detox.DetoxConfig} */
module.exports = {
	testRunner: {
		args: {
			$0: "jest",
			config: "e2e/jest.config.js",
		},
		jest: {
			setupTimeout: 120_000,
			teardownTimeout: 30_000,
		},
	},
	artifacts: {
		rootDir: "e2e/artifacts",
		plugins: {
			log: "failing",
			screenshot: "failing",
			video: "none",
		},
	},
	apps: {
		"android.debug": {
			type: "android.apk",
			binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
			build: "cd android && ./gradlew :app:assembleDebug :app:assembleDebugAndroidTest -DtestBuildType=debug",
			reversePorts: [metroPort],
		},
	},
	devices: {
		attached: {
			type: "android.attached",
			device: { adbName: deviceId },
		},
	},
	configurations: {
		"android.attached.debug": {
			device: "attached",
			app: "android.debug",
		},
	},
}
