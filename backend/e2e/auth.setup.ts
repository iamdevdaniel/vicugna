import { mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { expect, test as setup } from "@playwright/test"
import { adminAuthFile, getAdminCredentials } from "./admin-auth"

setup.use({ trace: "off" })

setup("inicia una sesión administrativa", async ({ context, page }) => {
	const credentials = getAdminCredentials()
	await context.clearCookies()
	await page.goto("login")
	await page.getByLabel("Correo").fill(credentials.email)
	await page.getByLabel("Contraseña").fill(credentials.password)
	await page.getByRole("button", { name: "Entrar" }).click()

	await expect(page).toHaveURL(/\/admin-v2\/$/)
	await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible()

	await mkdir(dirname(adminAuthFile), { recursive: true })
	await context.storageState({ path: adminAuthFile })
})
