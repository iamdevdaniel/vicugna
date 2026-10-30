const { device } = require("detox")
const {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} = require("@jest/globals")
const {
	byLabelContaining,
	byPressableLabel,
	byText,
	expectEnabled,
	expectFieldValue,
	openPermit,
	relaunchApp,
	replaceField,
	resetLoginAndLoadPermits,
	tapLabel,
	tapLabelContaining,
	tapText,
} = require("./support")
const { AndroidSyncEnvironment, SYNC_FIXTURES } = require("./sync-environment")

const expectedPermits = SYNC_FIXTURES.map((fixture) => fixture.permitNumber)
const replacementSnapshot = {
	tagNumber: 940003,
	extraTagNumber: 940004,
	fleeceNumber: "950003",
}

describe("Android permit sync, conflicts, and retries", () => {
	let syncEnvironment

	beforeAll(async () => {
		syncEnvironment = new AndroidSyncEnvironment()
		await syncEnvironment.start()
	})

	afterAll(async () => {
		await syncEnvironment?.stop()
	})

	beforeEach(async () => {
		await syncEnvironment.reset()
		await resetLoginAndLoadPermits(
			expectedPermits,
			syncEnvironment.testUser,
		)
	})

	test("1. downloads a permit sent by another device, reopens, edits, and sends", async () => {
		const fixture = getFixture("handoff")
		await expectReadOnlyParticipantNotes(
			fixture,
			`Original server data ${fixture.permitNumber}`,
		)

		await syncEnvironment.reopen(fixture.permitNumber)
		await refreshPermits()
		await changeParticipantNotes(fixture, "Device B change")
		await sendPermit(fixture.permitNumber)

		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
		expect(await syncEnvironment.getServerNotes(fixture.permitNumber)).toBe(
			"Device B change",
		)
	})

	test("2. keeps local data and shows the conflict again", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Preserved local change")
		await syncEnvironment.setServerNotes(
			fixture.permitNumber,
			"Server change",
		)

		await refreshPermits()
		await expectConflictFor(fixture.permitNumber)
		await tapText("Conservar por ahora")
		await expectParticipantNotes(fixture, "Preserved local change")

		await relaunchApp()
		await expectConflictFor(fixture.permitNumber)
		await tapText("Conservar por ahora")
	})

	test("3. replaces a conflict with the complete server snapshot", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Discardable local change")
		await syncEnvironment.setServerNotes(
			fixture.permitNumber,
			"Accepted server change",
		)
		await syncEnvironment.setServerReplacementSnapshot(
			fixture.permitNumber,
			replacementSnapshot,
		)

		await refreshPermits()
		await expectConflictFor(fixture.permitNumber)
		await tapText("Usar datos del servidor")
		await expectSnackbar("Se guardaron los datos del servidor")
		await expectParticipantNotes(fixture, "Accepted server change")
		await expectShearingSnapshot(fixture, replacementSnapshot)
		await expectFiberSnapshot(fixture, replacementSnapshot)
	})

	test("4. resolves two conflicts one at a time", async () => {
		const first = getFixture("handoff")
		const second = getFixture("local")
		await syncEnvironment.reopen(first.permitNumber)
		await refreshPermits()
		await changeParticipantNotes(first, "Local A")
		await changeParticipantNotes(second, "Local B")
		await syncEnvironment.setServerNotes(first.permitNumber, "Server A")
		await syncEnvironment.setServerNotes(second.permitNumber, "Server B")

		await refreshPermits()
		await expectConflictFor(first.permitNumber)
		await tapText("Conservar por ahora")
		await expectConflictFor(second.permitNumber)
		await tapText("Usar datos del servidor")
		await expectSnackbar("Se guardaron los datos del servidor")

		await expectParticipantNotes(first, "Local A")
		await expectParticipantNotes(second, "Server B")
	})

	test("5. keeps the pending send for retry after an app restart", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Pending after restart")
		await openPermit(fixture.permitNumber)
		await loseSendResponse(syncEnvironment, fixture.permitNumber)
		await device.pressBack()

		await relaunchApp()
		await byLabelContaining(`Permiso ${fixture.permitNumber}`, {
			timeout: 30_000,
		})
		await openPermit(fixture.permitNumber)
		await retryPermit()
		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})

	test("6. keeps the pending send for retry after logout and login", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Pending after logout")
		await openPermit(fixture.permitNumber)
		await loseSendResponse(syncEnvironment, fixture.permitNumber)
		await device.pressBack()

		await logoutAndLogin(syncEnvironment.testUser)
		await openPermit(fixture.permitNumber)
		await retryPermit()
		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})

	test("7. keeps the pending send when authentication is rejected during retry", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Pending after session expiry")
		await openPermit(fixture.permitNumber)
		await loseSendResponse(syncEnvironment, fixture.permitNumber)

		await syncEnvironment.setTestUserActive(false)
		await tapLabel("Reintentar envío")
		await expectSnackbar(
			"Tu sesión terminó. Inicia sesión y vuelve a intentar el envío.",
		)
		await expectEnabled("Reintentar envío", true)
		await device.pressBack()

		await syncEnvironment.setTestUserActive(true)
		await logoutAndLogin(syncEnvironment.testUser)
		await openPermit(fixture.permitNumber)
		await retryPermit()
		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})

	test("8. keeps local data when an administrator cancels reopening", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(
			fixture,
			"Local change before reopening cancellation",
		)
		await syncEnvironment.cancelReopening(fixture.permitNumber)

		await refreshPermits()
		await openPermit(fixture.permitNumber)
		await byText("Envío bloqueado")
		await device.pressBack()
		await expectReadOnlyParticipantNotes(
			fixture,
			"Local change before reopening cancellation",
		)

		await syncEnvironment.reopen(fixture.permitNumber)
		await relaunchApp()
		await byLabelContaining(`Permiso ${fixture.permitNumber}`, {
			timeout: 30_000,
		})
		await openPermit(fixture.permitNumber)
		await sendPermitFromOpenPermit()
		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})

	test("9. shows retry when the send response never arrives", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Pending after missing response")
		await openPermit(fixture.permitNumber)

		await sendOpenPermitAndLoseResponse(
			syncEnvironment,
			fixture.permitNumber,
		)

		await expectEnabled("Reintentar envío", true)
	})

	test("10. retries successfully when the send response never arrives", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Retry after missing response")
		await openPermit(fixture.permitNumber)

		await sendOpenPermitAndLoseResponse(
			syncEnvironment,
			fixture.permitNumber,
		)
		await retryPermit()

		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})

	test("11. keeps the pending send and retries after a malformed response", async () => {
		const fixture = getFixture("local")
		await changeParticipantNotes(fixture, "Retry after malformed response")
		await openPermit(fixture.permitNumber)

		await syncEnvironment.startMalformedResponse()
		try {
			await expectEnabled("Finalizar y enviar", true)
			await tapLabel("Finalizar y enviar")
			await tapText("Continuar", { scroll: false })
			await syncEnvironment.waitForStatus(fixture.permitNumber, "synced")
			await expectSnackbar(
				"No se pudo confirmar si el permiso se envió. Sus datos están guardados. Pulse Reintentar envío.",
			)
		} finally {
			await syncEnvironment.finishMalformedResponse()
		}

		await expectEnabled("Reintentar envío", true)
		await retryPermit()
		expect(await syncEnvironment.getStatus(fixture.permitNumber)).toBe(
			"synced",
		)
	})
})

function getFixture(key) {
	const fixture = SYNC_FIXTURES.find((item) => item.key === key)
	if (!fixture) throw new Error(`Missing sync fixture: ${key}`)
	return fixture
}

async function refreshPermits() {
	await tapText("Actualizar permisos", { scroll: false })
}

async function expectConflictFor(permitNumber) {
	await byText(
		`El permiso ${permitNumber} tiene otros datos en el servidor. Si reemplazas, se borrarán los datos guardados en este dispositivo.`,
		{ scroll: false, timeout: 30_000 },
	)
}

async function changeParticipantNotes(fixture, notes) {
	await openPermit(fixture.permitNumber)
	await tapLabel("Abrir Participantes")
	await tapLabelContaining(`cédula ${fixture.identityNumber}`)
	await replaceField("Participante: notas", notes)
	await expectEnabled("Guardar participante", true)
	await tapLabel("Guardar participante")
	await byPressableLabel("Añadir participante")
	await device.pressBack()
	await device.pressBack()
}

async function expectParticipantNotes(fixture, notes) {
	await openPermit(fixture.permitNumber)
	await tapLabel("Abrir Participantes")
	await tapLabelContaining(`cédula ${fixture.identityNumber}`)
	await expectFieldValue("Participante: notas", notes)
	await device.pressBack()
	await device.pressBack()
	await device.pressBack()
}

async function expectReadOnlyParticipantNotes(fixture, notes) {
	await openPermit(fixture.permitNumber)
	await tapLabel("Abrir Participantes")
	await tapLabelContaining(`cédula ${fixture.identityNumber}`)
	await byText(notes)
	await device.pressBack()
	await device.pressBack()
	await device.pressBack()
}

async function expectShearingSnapshot(fixture, snapshot) {
	await openPermit(fixture.permitNumber)
	await tapLabel("Abrir Esquila")
	await byText("Total 2")
	await tapLabelContaining(`Registro de esquila ${snapshot.tagNumber}`)
	await expectFieldValue("Esquila: número de arete", snapshot.tagNumber)
	await device.pressBack()
	await byLabelContaining(`Registro de esquila ${snapshot.extraTagNumber}`)
	await device.pressBack()
	await device.pressBack()
}

async function expectFiberSnapshot(fixture, snapshot) {
	await openPermit(fixture.permitNumber)
	await tapLabel("Abrir Registro de fibra")
	await byText("Total 1")
	await tapLabelContaining(`registro de fibra ${snapshot.fleeceNumber}`)
	await expectFieldValue("Fibra: número de vellón", snapshot.fleeceNumber)
	await device.pressBack()
	await device.pressBack()
	await device.pressBack()
}

async function sendPermit(permitNumber) {
	await openPermit(permitNumber)
	await sendPermitFromOpenPermit()
}

async function sendPermitFromOpenPermit() {
	await expectEnabled("Finalizar y enviar", true)
	await tapLabel("Finalizar y enviar")
	await tapText("Continuar", { scroll: false })
	await expectSnackbar("El permiso se envió correctamente")
	await byText("Envío bloqueado")
}

async function loseSendResponse(environment, permitNumber) {
	await environment.startLostResponse()
	try {
		await expectEnabled("Finalizar y enviar", true)
		await tapLabel("Finalizar y enviar")
		await tapText("Continuar", { scroll: false })
		await environment.waitForStatus(permitNumber, "synced")
	} finally {
		await environment.finishLostResponse()
	}
	await expectSnackbar(
		"No hay conexión. Tus datos están guardados. Conéctate a internet y pulsa Reintentar envío.",
	)
	await expectEnabled("Reintentar envío", true)
}

async function sendOpenPermitAndLoseResponse(environment, permitNumber) {
	await environment.startLostResponse()
	await expectEnabled("Finalizar y enviar", true)
	await tapLabel("Finalizar y enviar")
	const continueButton = await byText("Continuar", { scroll: false })
	await device.disableSynchronization()
	try {
		await continueButton.tap()
		const retryButton = await byPressableLabel("Reintentar envío", {
			scroll: false,
			timeout: 120_000,
		})
		expect((await retryButton.getAttributes()).enabled).toBe(true)
		await expectSnackbar(
			"No hay conexión. Tus datos están guardados. Conéctate a internet y pulsa Reintentar envío.",
		)
		await environment.waitForStatus(permitNumber, "synced")
	} finally {
		await environment.finishLostResponse()
		await device.enableSynchronization()
	}
}

async function retryPermit() {
	await expectEnabled("Reintentar envío", true)
	await tapLabel("Reintentar envío")
	await expectSnackbar("El permiso se envió correctamente")
	await byText("Envío bloqueado")
}

async function expectSnackbar(message, timeout = 30_000) {
	await byText(message, { scroll: false, timeout })
}

async function logoutAndLogin(credentials) {
	await tapLabel("Abrir menú de cuenta")
	await tapLabel("Cerrar sesión")
	await tapLabel("Iniciar sesión", { scroll: false })
	await replaceField("Inicio de sesión: correo", credentials.email)
	await replaceField("Inicio de sesión: contraseña", credentials.password)
	await tapLabel("Enviar inicio de sesión")
	await byLabelContaining(`Permiso ${expectedPermits[0]}`, {
		timeout: 30_000,
	})
}
