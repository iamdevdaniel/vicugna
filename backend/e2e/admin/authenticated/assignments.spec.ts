import { expect, type Locator, type Page, test } from "@playwright/test"
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
		await expect(editor.getByText("Lucía Choque Condori")).toBeVisible()
		await expect(editor.getByText("Rosa Condori Mamani")).toBeVisible()
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
				"Selecciona un permiso para configurar sus encargados.",
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

	test("crea, renombra y asigna encargados a un permiso", async ({
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

		await addAssignedUser(editor, "María Quispe Flores")
		await addAssignedUser(editor, "Juan Mamani Choque")
		const juanRow = editor.getByText("Juan Mamani Choque").locator("..")
		await juanRow.getByRole("button", { name: "Principal" }).click()
		await editor
			.getByRole("button", { name: "Subir Juan Mamani Choque" })
			.click()
		await editor
			.getByRole("button", { name: "Guardar asignaciones" })
			.click()
		await expect(page.getByRole("status")).toContainText(
			"Asignaciones guardadas",
		)

		const assignmentCard = getAssignmentsPanel(page).getByRole("button", {
			name: /Permiso E2E-RENAMED/,
		})
		await expect(assignmentCard).toContainText(
			"Juan Mamani Choque · Principal",
		)
		await expect(
			assignmentCard.getByText("María Quispe Flores", { exact: true }),
		).toBeVisible()
		await expect(assignmentCard.getByText(/· Principal$/)).toHaveCount(1)
		const cardText = await assignmentCard.innerText()
		expect(cardText.indexOf("Juan Mamani Choque")).toBeLessThan(
			cardText.indexOf("María Quispe Flores"),
		)

		await page.reload({ waitUntil: "networkidle" })
		await selectSeedCommunity(page)
		await getCreatePermitPanel(page)
			.getByRole("button", { name: /E2E-RENAMED/ })
			.click()
		const reloadedEditor = getEditorPanel(page)
		await expect(
			reloadedEditor.getByText("Juan Mamani Choque"),
		).toBeVisible()
		await expect(
			reloadedEditor.getByRole("button", {
				name: "Principal",
				exact: true,
			}),
		).toHaveCount(2)
		await expect(
			reloadedEditor
				.getByText("Juan Mamani Choque")
				.locator("..")
				.getByRole("button", { name: "Principal", exact: true }),
		).toBeDisabled()
		await expect(
			reloadedEditor
				.getByText("María Quispe Flores")
				.locator("..")
				.getByRole("button", { name: "Principal", exact: true }),
		).toBeEnabled()
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

async function addAssignedUser(editor: Locator, userName: string) {
	await editor.getByLabel("Encargado").selectOption({ label: userName })
	await editor.getByRole("button", { name: "Añadir" }).click()
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
