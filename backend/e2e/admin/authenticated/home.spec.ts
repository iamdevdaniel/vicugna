import { expect, test } from "@playwright/test"
import { waitForAdminReady } from "../../admin-ready"

test.describe("Inicio administrativo", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("")
		await waitForAdminReady(page)
	})

	test("@responsive muestra las secciones principales sin desbordamiento", async ({
		page,
	}) => {
		await expect(
			page.getByRole("heading", { name: "Inicio" }),
		).toBeVisible()
		await expect(page.getByRole("link", { name: /Usuarios/ })).toBeVisible()
		await expect(
			page.getByRole("link", { name: /Asignaciones/ }),
		).toBeVisible()
		await expect(
			page.getByRole("link", { name: /Seguimiento/ }),
		).toBeVisible()
		await expect(
			page.getByRole("button", { name: "Cerrar sesión" }),
		).toBeVisible()
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

	test("abre las tres secciones desde sus tarjetas", async ({ page }) => {
		const sections = [
			{ name: /Usuarios/, path: "users", heading: "Usuarios" },
			{
				name: /Asignaciones/,
				path: "assignments",
				heading: "Asignaciones",
			},
			{ name: /Seguimiento/, path: "monitoring", heading: "Seguimiento" },
		]

		for (const section of sections) {
			await page.getByRole("link", { name: section.name }).click()
			await expect(page).toHaveURL(new RegExp(`/admin/${section.path}$`))
			await expect(
				page.getByRole("heading", {
					name: section.heading,
					exact: true,
				}),
			).toBeVisible()
			await page.goto("")
			await waitForAdminReady(page)
		}
	})

	test("redirige el enlace anterior del panel al inicio", async ({
		page,
	}) => {
		await page.goto("mission-control")
		await waitForAdminReady(page)
		await expect(page).toHaveURL(/\/admin\/$/)
		await expect(
			page.getByRole("heading", { name: "Inicio" }),
		).toBeVisible()
	})
})
