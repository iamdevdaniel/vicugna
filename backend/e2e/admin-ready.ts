import type { Page } from "@playwright/test"

export async function waitForAdminReady(page: Page) {
	await page.locator('[data-admin-hydrated="true"]').waitFor()
}
