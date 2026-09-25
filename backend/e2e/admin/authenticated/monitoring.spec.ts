import { expect, type Page, test } from "@playwright/test"
import { waitForAdminReady } from "../../admin-ready"

test.describe("Seguimiento de permisos", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("monitoring", { waitUntil: "networkidle" })
		await waitForAdminReady(page)
		await expect(
			page.getByRole("heading", { name: "Seguimiento", exact: true }),
		).toBeVisible()
	})

	test("@responsive filtra permisos y abre su detalle", async ({ page }) => {
		const season = page.getByLabel("Temporada")
		await expect(season).toHaveValue("season-2026")
		await expect(page.getByText(/^\d+ comunidades$/)).toBeVisible()
		await expect(page.getByText(/^\d+ permisos$/)).toBeVisible()
		await expect(page.getByText(/^\d+ encargados$/)).toBeVisible()

		const search = page.getByRole("searchbox", { name: "Buscar" })
		await search.fill("ASG-003")
		await expect(getPermitLink(page, "ASG-003")).toBeVisible()
		await expect(getPermitLink(page, "ASG-001")).toHaveCount(0)

		await search.clear()
		const syncedFilter = page.getByRole("button", {
			name: "Sincronizados",
		})
		await syncedFilter.click()
		await expect(syncedFilter).toHaveAttribute("aria-pressed", "true")
		await expect(getPermitLink(page, "ASG-003")).toBeVisible()
		await expect(getPermitLink(page, "ASG-001")).toHaveCount(0)

		await getPermitLink(page, "ASG-003").click()
		await expect(
			page.getByRole("heading", { name: "Permiso ASG-003" }),
		).toBeVisible()
		await expect(
			page.getByText("Participantes").locator(".."),
		).toContainText("1")
		await expect(
			page.getByText("Registros de esquila").locator(".."),
		).toContainText("1")
		await expect(
			page.getByText("Registros de fibra").locator(".."),
		).toContainText("1")
		await expectNoHorizontalOverflow(page)

		await page.getByRole("link", { name: "Volver al resumen" }).click()
		await expect(getPermitLink(page, "ASG-003")).toBeVisible()
		await expect(syncedFilter).toHaveAttribute("aria-pressed", "true")
		await expect(getPermitLink(page, "ASG-001")).toHaveCount(0)

		await season.selectOption("season-2025")
		await expect(page).toHaveURL(/seasonId=season-2025/)
		await expect(
			page.getByText("No hay asignaciones para esta temporada."),
		).toBeVisible()
	})

	test("genera reportes y reabre un permiso sincronizado", async ({
		page,
	}) => {
		await page.getByRole("searchbox", { name: "Buscar" }).fill("ASG-002")
		await getPermitLink(page, "ASG-002").click()

		await expect(
			page.getByRole("heading", { name: "Permiso ASG-002" }),
		).toBeVisible()
		const downloadPromise = page.waitForEvent("download")
		await page.getByRole("link", { name: "Generar reportes" }).click()
		const download = await downloadPromise
		expect(download.suggestedFilename()).toBe("reportes-ASG-002.zip")

		page.once("dialog", (dialog) => dialog.accept())
		await page.getByRole("button", { name: "Reabrir permiso" }).click()
		await expect(
			page.getByRole("status").filter({ hasText: "Permiso reabierto" }),
		).toHaveText("Permiso reabierto")
		await expect(page.getByText("Reabierto", { exact: true })).toBeVisible()
		await expect(
			page.getByRole("button", { name: "Reabrir permiso" }),
		).toHaveCount(0)

		await page.reload({ waitUntil: "networkidle" })
		await expect(page.getByText("Reabierto", { exact: true })).toBeVisible()
	})
})

function getPermitLink(page: Page, permitNumber: string) {
	return page.getByRole("link", {
		name: new RegExp(`Permiso ${permitNumber}`),
	})
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
