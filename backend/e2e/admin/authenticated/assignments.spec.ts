import { expect, type Page, test } from "@playwright/test"
import { waitForAdminReady } from "../../admin-ready"

test.describe("Administración de asignaciones", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("assignments", { waitUntil: "networkidle" })
		await waitForAdminReady(page)
		await expect(
			page.getByRole("heading", { name: "Asignaciones", exact: true }),
		).toBeVisible()
	})

	test("@responsive cambia de temporada y abre un permiso", async ({
		page,
	}) => {
		const season = page.getByLabel("Temporada")
		await expect(season).toHaveValue("season-2026")

		await season.selectOption("season-2025")
		await expect(page).toHaveURL(/seasonId=season-2025/)
		await expect(
			page.getByText("Aún no hay permisos para esta temporada."),
		).toBeVisible()

		await page.getByLabel("Temporada").selectOption("season-2026")
		await expect(page).toHaveURL(/seasonId=season-2026/)
		await selectSeedCommunity(page)
		await getCreatePermitPanel(page)
			.getByRole("button", { name: /ASG-001/ })
			.click()

		const editor = getEditorPanel(page)
		await expect(editor.getByText("ASG-001", { exact: true })).toBeVisible()
		await expect(editor.getByLabel("Encargado responsable")).toHaveValue(
			"user-seed-03",
		)
		await expectNoHorizontalOverflow(page)
	})

	test("protege un permiso nuevo que todavía no fue guardado", async ({
		page,
	}) => {
		await selectSeedCommunity(page)
		const createPanel = getCreatePermitPanel(page)
		const permitNumber = createPanel.getByLabel("Nuevo permiso")
		await permitNumber.fill("BORRADOR-E2E")

		page.once("dialog", async (dialog) => {
			expect(dialog.message()).toBe(
				"Hay cambios sin guardar. ¿Quieres descartarlos?",
			)
			await dialog.dismiss()
		})
		await createPanel.getByRole("button", { name: /ASG-001/ }).click()

		await expect(permitNumber).toHaveValue("BORRADOR-E2E")
		await expect(
			getEditorPanel(page).getByText(
				"Selecciona un permiso para configurar su encargado.",
			),
		).toBeVisible()
	})

	test("rechaza crear un permiso repetido", async ({ page }) => {
		await selectSeedCommunity(page)
		const createPanel = getCreatePermitPanel(page)
		await expect(
			createPanel.getByRole("button", { name: "Crear", exact: true }),
		).toBeDisabled()

		await createPanel.getByLabel("Nuevo permiso").fill("ASG-001")
		await createPanel
			.getByRole("button", { name: "Crear", exact: true })
			.click()

		await expect(page.getByRole("alert")).toHaveText(
			"Ese permiso ya existe",
		)
	})

	test("crea, renombra y asigna un encargado a un permiso", async ({
		page,
	}) => {
		await selectSeedCommunity(page)
		const createPanel = getCreatePermitPanel(page)
		await createPanel.getByLabel("Nuevo permiso").fill("E2E-001")
		await createPanel
			.getByRole("button", { name: "Crear", exact: true })
			.click()
		await expect(page.getByRole("status")).toContainText("Permiso creado")

		const editor = getEditorPanel(page)
		await expect(editor.getByText("E2E-001", { exact: true })).toBeVisible()
		await editor.getByRole("button", { name: "Renombrar" }).click()
		await editor.locator('input[name="permitNumber"]').fill("E2E-RENAMED")
		await editor
			.getByRole("button", { name: "Guardar", exact: true })
			.click()
		await expect(page.getByRole("status")).toContainText(
			"Permiso actualizado",
		)
		await expect(
			editor.getByText("E2E-RENAMED", { exact: true }),
		).toBeVisible()

		await editor
			.getByLabel("Encargado responsable")
			.selectOption({ label: "María Quispe Flores" })
		await editor.getByRole("button", { name: "Guardar encargado" }).click()
		await expect(page.getByRole("status")).toContainText(
			"Encargado guardado",
		)
		await editor
			.getByLabel("Encargado responsable")
			.selectOption({ label: "Juan Mamani Choque" })
		await editor.getByRole("button", { name: "Guardar encargado" }).click()

		const assignmentCard = getAssignmentsPanel(page).getByRole("button", {
			name: /Permiso E2E-RENAMED/,
		})
		await expect(assignmentCard).toContainText("Juan Mamani Choque")
		await expect(assignmentCard).not.toContainText("María Quispe Flores")

		await page.reload({ waitUntil: "networkidle" })
		await selectSeedCommunity(page)
		await getCreatePermitPanel(page)
			.getByRole("button", { name: /E2E-RENAMED/ })
			.click()
		const reloadedEditor = getEditorPanel(page)
		await expect(
			reloadedEditor.getByLabel("Encargado responsable"),
		).toHaveValue("user-seed-02")
		await reloadedEditor
			.getByLabel("Encargado responsable")
			.selectOption("")
		await reloadedEditor
			.getByRole("button", { name: "Guardar encargado" })
			.click()
		await expect(
			getAssignmentsPanel(page).getByRole("button", {
				name: /Permiso E2E-RENAMED/,
			}),
		).toHaveCount(0)
	})

	test("bloquea cambiar el encargado después de descargar", async ({
		page,
	}) => {
		await selectSeedCommunity(page)
		const createPanel = getCreatePermitPanel(page)
		await createPanel.getByLabel("Nuevo permiso").fill("DESCARGADO-E2E")
		await createPanel
			.getByRole("button", { name: "Crear", exact: true })
			.click()

		const editor = getEditorPanel(page)
		await editor
			.getByLabel("Encargado responsable")
			.selectOption({ label: "Carlos Huanca Quispe" })
		await editor.getByRole("button", { name: "Guardar encargado" }).click()

		const loginResponse = await page.request.post(
			new URL("/mobile/auth/login", page.url()).toString(),
			{
				data: {
					email: "carlos.huanca@gmail.com",
					password: "e2e-carlos-password",
				},
			},
		)
		expect(loginResponse.ok()).toBe(true)
		const login = (await loginResponse.json()) as {
			data: { token: string }
		}
		const permitsResponse = await page.request.get(
			new URL("/mobile/permits", page.url()).toString(),
			{ headers: { Authorization: `Bearer ${login.data.token}` } },
		)
		expect(permitsResponse.ok()).toBe(true)

		await editor
			.getByLabel("Encargado responsable")
			.selectOption({ label: "María Quispe Flores" })
		await editor.getByRole("button", { name: "Guardar encargado" }).click()

		await expect(page.getByRole("alert")).toHaveText(
			"El encargado no puede cambiarse después de descargar el permiso",
		)
	})
})

async function selectSeedCommunity(page: Page) {
	const community = page.getByRole("combobox", {
		name: "Comunidad",
		exact: true,
	})
	await expect(
		community
			.locator("option")
			.filter({ hasText: /^AGUAQUISA \([1-9]\d*\)$/ }),
	).toHaveCount(1)
	await community.selectOption("aguaquisa")
	await expect(community).toHaveValue("aguaquisa")
}

function getCreatePermitPanel(page: Page) {
	return page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "Crear permiso" }),
	})
}

function getEditorPanel(page: Page) {
	return page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "Configurar permiso" }),
	})
}

function getAssignmentsPanel(page: Page) {
	return page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "Asignaciones actuales" }),
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
