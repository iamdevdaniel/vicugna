import http from "node:http"
import { expect, test } from "@playwright/test"
import { waitForAdminReady } from "../admin-ready"

function postRawPath(baseURL: string, path: string) {
	return new Promise<{ body: string; status: number | undefined }>(
		(resolve, reject) => {
			const base = new URL(baseURL)
			const request = http.request(
				{
					hostname: base.hostname,
					method: "POST",
					path,
					port: base.port,
				},
				(response) => {
					let body = ""
					response.setEncoding("utf8")
					response.on("data", (chunk) => {
						body += chunk
					})
					response.on("end", () => {
						resolve({ body, status: response.statusCode })
					})
				},
			)
			request.on("error", reject)
			request.end()
		},
	)
}

test.describe("Inicio de sesión administrativo", () => {
	test.beforeEach(async ({ context, page }) => {
		await context.clearCookies()
		await page.goto("login")
		await waitForAdminReady(page)
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

	test("rechaza rutas administrativas ambiguas", async ({ baseURL }) => {
		if (typeof baseURL !== "string") {
			throw new Error("Playwright baseURL is required")
		}

		for (const path of [
			"/admin/assets/../login",
			"/admin/assets/%2e%2e/login",
		]) {
			const response = await postRawPath(baseURL, path)
			expect(response.status).toBe(400)
			expect(response.body).toContain("Ruta administrativa no válida")
		}
	})
})
