const { by, device, element, expect: detoxExpect } = require("detox")
const { describe, test } = require("@jest/globals")
const {
	addParticipant,
	openWorkflowStep,
	verifyParticipant,
} = require("./flows")
const {
	byLabelContaining,
	byPressableLabel,
	HAPPY_PERMIT,
	openPermit,
	replaceField,
	requiredEnvironment,
	resetLoginAndLoadPermits,
	tapLabel,
} = require("./support")

const SECOND_USER_PERMIT = "ISOLATION-02"

const accountOneParticipant = {
	name: "Cuenta Uno",
	lastNames: "Aislada E2E",
	gender: "Femenino",
	identityNumber: "940001",
	notes: "Solo pertenece a la primera cuenta",
}

async function logout() {
	await tapLabel("Abrir menú de cuenta")
	await tapLabel("Cerrar sesión")
	await byPressableLabel("Iniciar sesión", {
		scroll: false,
		timeout: 30_000,
	})
}

async function login(email, password, expectedPermit) {
	await tapLabel("Iniciar sesión", { scroll: false })
	await replaceField("Inicio de sesión: correo", email)
	await replaceField("Inicio de sesión: contraseña", password)
	await tapLabel("Enviar inicio de sesión")
	await byLabelContaining(`Permiso ${expectedPermit}`, { timeout: 120_000 })
}

describe("Aislamiento local entre cuentas", () => {
	test("cada usuario ve y conserva solamente sus propios datos", async () => {
		await resetLoginAndLoadPermits()

		await openPermit(HAPPY_PERMIT)
		await openWorkflowStep("Participantes")
		await addParticipant(accountOneParticipant)
		await device.pressBack()
		await device.pressBack()

		await logout()
		await login(
			requiredEnvironment("E2E_TEST_USER_02_EMAIL"),
			requiredEnvironment("E2E_TEST_USER_02_PASSWORD"),
			SECOND_USER_PERMIT,
		)
		await detoxExpect(element(by.text(HAPPY_PERMIT))).not.toExist()

		await openPermit(SECOND_USER_PERMIT)
		await device.pressBack()
		await logout()

		await login(
			requiredEnvironment("E2E_TEST_USER_01_EMAIL"),
			requiredEnvironment("E2E_TEST_USER_01_PASSWORD"),
			HAPPY_PERMIT,
		)
		await detoxExpect(element(by.text(SECOND_USER_PERMIT))).not.toExist()

		await openPermit(HAPPY_PERMIT)
		await tapLabel("Abrir Participantes")
		await verifyParticipant(accountOneParticipant)
	})
})
