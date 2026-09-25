import { expect, type Page, test } from "@playwright/test"
import { waitForAdminReady } from "../../admin-ready"

const createdUser = {
	firstName: "Elena",
	paternalLastName: "Prueba",
	maternalLastName: "Playwright",
	phoneNumber: "79990001",
	email: "elena.playwright@example.com",
}

test.describe("Administración de usuarios", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("users")
		await waitForAdminReady(page)
		await expect(
			page.getByRole("heading", { name: "Usuarios", exact: true }),
		).toBeVisible()
	})

	test("@responsive cambia de lista y abre y cancela el formulario", async ({
		page,
	}) => {
		await expect(page.getByText("María Quispe Flores")).toBeVisible()

		await page.getByRole("link", { name: /Administradores/ }).click()
		await expect(
			page.getByRole("heading", { name: "Admin E2E Pruebas" }),
		).toBeVisible()
		await expect(
			page.getByRole("button", { name: "Nuevo encargado" }),
		).toHaveCount(0)

		await page.getByRole("link", { name: /Encargados/ }).click()
		await page.getByRole("button", { name: "Nuevo encargado" }).click()
		await expect(
			page.getByRole("heading", { name: "Nuevo usuario" }),
		).toBeVisible()
		await expect(page.getByLabel("Nombres")).toBeFocused()

		await page.getByRole("button", { name: "Cancelar" }).click()
		await expect(
			page.getByRole("heading", { name: "Nuevo usuario" }),
		).toHaveCount(0)
		await expectNoHorizontalOverflow(page)
	})

	test("valida los campos obligatorios y sugiere una contraseña", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Nuevo encargado" }).click()
		await page.getByRole("button", { name: "Crear usuario" }).click()

		const firstName = page.getByLabel("Nombres")
		await expect(firstName).toBeFocused()
		await expect(firstName).toHaveJSProperty("validity.valueMissing", true)

		const password = page.getByLabel("Contraseña temporal")
		const suggestionResponse = page.waitForResponse((response) =>
			response.url().includes("users/password-suggestion.data"),
		)
		await page.getByRole("button", { name: "Sugerir" }).click()
		expect((await suggestionResponse).status()).toBe(200)
		await expect(password).toHaveValue(/^[a-z]+-[a-z]+-\d{2}$/)
	})

	test("crea un encargado y rechaza repetir su correo", async ({ page }) => {
		await openAndFillUserForm(page, "79990001")
		await page.getByRole("button", { name: "Crear usuario" }).click()

		await expect(page.getByRole("status")).toContainText("Usuario creado")
		const createdCard = page
			.getByRole("article")
			.filter({ hasText: "Elena Prueba Playwright" })
		await expect(createdCard).toContainText(createdUser.phoneNumber)
		await expect(createdCard).toContainText(createdUser.email)
		await expect(createdCard).toContainText("Activo")

		await openAndFillUserForm(page, "79990002")
		await page.getByRole("button", { name: "Crear usuario" }).click()

		await expect(page.getByRole("alert")).toHaveText("Ese correo ya existe")
		await expect(
			page.getByRole("heading", { name: "Nuevo usuario" }),
		).toBeVisible()
	})
})

async function openAndFillUserForm(page: Page, phoneNumber: string) {
	await page.getByRole("button", { name: "Nuevo encargado" }).click()
	await page.getByLabel("Nombres").fill(createdUser.firstName)
	await page.getByLabel("Apellido paterno").fill(createdUser.paternalLastName)
	await page.getByLabel("Apellido materno").fill(createdUser.maternalLastName)
	await page.getByLabel("Teléfono").fill(phoneNumber)
	await page.getByLabel("Correo").fill(createdUser.email)
}

async function expectNoHorizontalOverflow(page: Page) {
	await expect
		.poll(() =>
			page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		)
		.toBe(true)
}
