import "dotenv/config"
import { defineConfig, devices } from "@playwright/test"
import { adminAuthFile } from "./admin-auth"

const port = process.env.E2E_PORT ?? "3100"
const baseURL = `http://127.0.0.1:${port}/admin-v2/`
const databaseUrl = process.env.VICUGNA_E2E_DATABASE_URL?.trim()

if (!databaseUrl) {
	throw new Error("VICUGNA_E2E_DATABASE_URL is required for Playwright")
}

export default defineConfig({
	testDir: ".",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: 0,
	reporter: "list",
	use: {
		baseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "auth-setup",
			testMatch: "**/auth.setup.ts",
		},
		{
			name: "login-desktop",
			testMatch: "**/admin/login.spec.ts",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "login-mobile",
			testMatch: "**/admin/login.spec.ts",
			grep: /@responsive/,
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "admin-desktop",
			testMatch: "**/admin/authenticated/**/*.spec.ts",
			dependencies: ["auth-setup"],
			use: {
				...devices["Desktop Chrome"],
				storageState: adminAuthFile,
				trace: "off",
			},
		},
		{
			name: "admin-mobile",
			testMatch: "**/admin/authenticated/**/*.spec.ts",
			dependencies: ["auth-setup"],
			grep: /@responsive/,
			use: {
				...devices["Pixel 7"],
				storageState: adminAuthFile,
				trace: "off",
			},
		},
	],
	webServer: {
		command: "npm start",
		env: {
			PORT: port,
			NODE_ENV: "test",
			VICUGNA_DATABASE_URL: databaseUrl,
		},
		url: `${baseURL}login`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
})
