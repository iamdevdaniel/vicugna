import { expect, test } from "@playwright/test"

test.use({ trace: "off" })

test("inicia sesión como administrador", async ({ context, page }) => {
	const credentials = getAdminCredentials()
	await context.clearCookies()
	await page.goto("login")
	await page.getByLabel("Correo").fill(credentials.email)
	await page.getByLabel("Contraseña").fill(credentials.password)
	await page.getByRole("button", { name: "Entrar" }).click()

	await expect(page).toHaveURL(/\/admin-v2\/$/)
	await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible()
})

function getAdminCredentials() {
	const email = process.env.E2E_ADMIN_EMAIL?.trim()
	const password = process.env.E2E_ADMIN_PASSWORD?.trim()

	if (!email || !password) {
		throw new Error(
			"E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required for the login test",
		)
	}

	return { email, password }
}
