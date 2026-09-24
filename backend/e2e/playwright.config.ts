import "dotenv/config"
import { defineConfig, devices } from "@playwright/test"

const port = process.env.E2E_PORT ?? "3100"
const baseURL = `http://127.0.0.1:${port}/admin-v2/`

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
			name: "desktop-chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile-chromium",
			grep: /@responsive/,
			use: { ...devices["Pixel 7"] },
		},
	],
	webServer: {
		command: "npm run build && npm start",
		env: {
			PORT: port,
			NODE_ENV: "test",
		},
		url: `${baseURL}login`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
})
