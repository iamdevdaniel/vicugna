import { expect, test } from "@playwright/test"

test.describe("Inicio de sesión administrativo", () => {
	test.beforeEach(async ({ context, page }) => {
		await context.clearCookies()
		await page.goto("login")
	})

	test("@responsive muestra un formulario usable y adaptable", async ({
		page,
	}) => {
		await expect(
			page.getByRole("heading", { name: "Inicio de sesión" }),
		).toBeVisible()
		await expect(page.getByLabel("Correo")).toBeVisible()
		await expect(page.getByLabel("Contraseña")).toHaveAttribute(
			"type",
			"password",
		)

		await page.getByRole("button", { name: "Mostrar" }).click()
		await expect(page.getByLabel("Contraseña")).toHaveAttribute(
			"type",
			"text",
		)
		await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						document.documentElement.scrollWidth <=
						window.innerWidth,
				),
			)
			.toBe(true)
	})

	test("rechaza credenciales inválidas", async ({ page }) => {
		await page.getByLabel("Correo").fill("admin-inexistente@example.com")
		await page.getByLabel("Contraseña").fill("contraseña-incorrecta")
		await page.getByRole("button", { name: "Entrar" }).click()

		await expect(page.getByText("Credenciales invalidas")).toBeVisible()
		await expect(page.getByLabel("Correo")).toHaveValue(
			"admin-inexistente@example.com",
		)
	})
})
