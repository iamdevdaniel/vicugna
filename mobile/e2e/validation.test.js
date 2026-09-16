const { device } = require("detox")
const { afterAll, beforeAll, describe, test } = require("@jest/globals")
const {
	addParticipant,
	addShearingRecord,
	openWorkflowStep,
} = require("./flows")
const {
	byPressableLabel,
	byText,
	drawSignature,
	expectChecked,
	expectEnabled,
	openPermit,
	replaceField,
	resetLoginAndLoadPermits,
	setTime,
	tapLabel,
	VALIDATION_PERMIT,
} = require("./support")

async function expectFieldError(field, value, message, validValue) {
	try {
		await replaceField(field, value)
		await byText(message)
	} finally {
		await replaceField(field, validValue)
	}
}

async function expectAcceptedCoordinateBoundary(
	field,
	rejectedValue,
	rejectedMessage,
	boundaryValue,
	validValue,
) {
	try {
		await replaceField(field, rejectedValue)
		await byText(rejectedMessage)

		await replaceField(field, boundaryValue)
		await expectEnabled("Guardar información general de esquila", true)
	} finally {
		await replaceField(field, validValue)
	}
}

function isDisabledTapError(error) {
	return (
		error instanceof Error &&
		/(?:not enabled|view is enabled)/i.test(error.message)
	)
}

async function attemptDisabledSelection(label) {
	const option = await byPressableLabel(label)
	try {
		await option.tap()
	} catch (error) {
		if (!isDisabledTapError(error)) throw error
	}
}

function requireReady(ready, prerequisite) {
	if (!ready) {
		throw new Error(`No se pudo preparar el requisito: ${prerequisite}`)
	}
}

describe("Validaciones de recolección local", () => {
	let participantReady = false
	let shearingHeaderReady = false
	let shearingRecordReady = false
	let fiberHeaderReady = false
	let fiberCommonReady = false
	let groomingReady = false
	let participantFormPrepared = false
	let shearingHeaderFormPrepared = false
	let shearingRecordFormPrepared = false
	let fiberHeaderFormPrepared = false
	let fiberCommonFormPrepared = false
	let groomingFormPrepared = false
	let dehearingFormPrepared = false

	beforeAll(async () => {
		await resetLoginAndLoadPermits()
		await openPermit(VALIDATION_PERMIT)
	})

	describe("Participantes", () => {
		beforeAll(async () => {
			await openWorkflowStep("Participantes")
			await tapLabel("Añadir participante")
			participantFormPrepared = true
		})

		test("exige el nombre", async () => {
			await expectFieldError(
				"Participante: nombre",
				"   ",
				"Requerido",
				"Eva",
			)
		})

		test("exige los apellidos", async () => {
			await expectFieldError(
				"Participante: apellidos",
				"   ",
				"Requerido",
				"Flores Lima",
			)
		})

		test("rechaza una cédula decimal", async () => {
			await expectFieldError(
				"Participante: cédula",
				"1.5",
				"Debe contener solo números enteros",
				"940001",
			)
		})

		test("rechaza una cédula igual a cero", async () => {
			try {
				await replaceField("Participante: cédula", "0")
				await byText("Debe ser mayor a 0")
			} finally {
				await replaceField("Participante: cédula", "940001")
			}
		})

		afterAll(async () => {
			if (!participantFormPrepared) return
			await device.pressBack()
			await addParticipant({
				name: "Eva",
				lastNames: "Flores Lima",
				gender: "Femenino",
				identityNumber: "940001",
				notes: "Participante para validaciones",
			})
			await device.pressBack()
			participantReady = true
		})
	})

	describe("Esquila - información general", () => {
		beforeAll(async () => {
			requireReady(participantReady, "un participante válido")
			await openWorkflowStep("Esquila")
			await tapLabel("Abrir Información general")
			await replaceField("Esquila general: sitio", "Corral validación")
			await replaceField("Esquila general: latitud", "-21.5")
			await replaceField("Esquila general: longitud", "-67.1")
			await replaceField("Esquila general: cantidad de arreos", "5")
			await tapLabel("Usar hoy para fecha de esquila")
			await setTime("Esquila general: hora inicial", 10, 0)
			await setTime("Esquila general: hora conclusión", 11, 0)
			shearingHeaderFormPrepared = true
		})

		test("exige el sitio", async () => {
			await expectFieldError(
				"Esquila general: sitio",
				"   ",
				"Campo requerido",
				"Corral validación",
			)
		})

		test("rechaza una latitud no numérica", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"abc",
				"Debe ser un número",
				"-21.5",
			)
		})

		test("rechaza una latitud menor que -90", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"-91",
				"No puede ser menor a -90",
				"-21.5",
			)
		})

		test("rechaza una latitud mayor que 90", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"91",
				"No puede superar 90",
				"-21.5",
			)
		})

		test("acepta los límites exactos de latitud", async () => {
			await expectAcceptedCoordinateBoundary(
				"Esquila general: latitud",
				"-91",
				"No puede ser menor a -90",
				"-90",
				"-21.5",
			)
			await expectAcceptedCoordinateBoundary(
				"Esquila general: latitud",
				"91",
				"No puede superar 90",
				"90",
				"-21.5",
			)
		})

		test("rechaza una longitud menor que -180", async () => {
			await expectFieldError(
				"Esquila general: longitud",
				"-181",
				"No puede ser menor a -180",
				"-67.1",
			)
		})

		test("rechaza una longitud mayor que 180", async () => {
			await expectFieldError(
				"Esquila general: longitud",
				"181",
				"No puede superar 180",
				"-67.1",
			)
		})

		test("acepta los límites exactos de longitud", async () => {
			await expectAcceptedCoordinateBoundary(
				"Esquila general: longitud",
				"-181",
				"No puede ser menor a -180",
				"-180",
				"-67.1",
			)
			await expectAcceptedCoordinateBoundary(
				"Esquila general: longitud",
				"181",
				"No puede superar 180",
				"180",
				"-67.1",
			)
		})

		test("rechaza una cantidad de arreos decimal", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"1.5",
				"Debe contener solo números enteros",
				"5",
			)
		})

		test("rechaza una cantidad de arreos igual a cero", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"0",
				"Debe ser mayor a 0",
				"5",
			)
		})

		test("rechaza más de 100 arreos", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"101",
				"No puede superar 100",
				"5",
			)
		})

		test("exige que la hora final sea posterior", async () => {
			try {
				await setTime("Esquila general: hora conclusión", 8, 0)
				await byText("La hora final debe ir después")
			} finally {
				await setTime("Esquila general: hora conclusión", 11, 0)
			}
		})

		afterAll(async () => {
			if (!shearingHeaderFormPrepared) return
			await expectEnabled("Guardar información general de esquila", true)
			await tapLabel("Guardar información general de esquila")
			shearingHeaderReady = true
		})
	})

	describe("Esquila - registro", () => {
		beforeAll(async () => {
			requireReady(
				shearingHeaderReady,
				"la información general de esquila",
			)
			await tapLabel("Añadir registro de esquila")
			await replaceField("Esquila: número de arete", "950001")
			await replaceField("Esquila: peso vivo", "38")
			await replaceField("Esquila: longitud de fibra", "5")
			shearingRecordFormPrepared = true
		})

		test("rechaza un número de arete decimal", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"1.5",
				"Debe contener solo números enteros",
				"950001",
			)
		})

		test("rechaza un número de arete igual a cero", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"0",
				"Debe ser mayor a 0",
				"950001",
			)
		})

		test("rechaza un número de arete mayor al límite", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"2147483648",
				"No puede superar 2.147.483.647",
				"950001",
			)
		})

		test("rechaza un peso vivo igual a cero", async () => {
			await expectFieldError(
				"Esquila: peso vivo",
				"0",
				"Debe ser mayor a 0 kg",
				"38",
			)
		})

		test("rechaza un peso vivo mayor a 100 kg", async () => {
			await expectFieldError(
				"Esquila: peso vivo",
				"101",
				"No puede superar 100 kg",
				"38",
			)
		})

		test("rechaza una longitud de fibra igual a cero", async () => {
			await expectFieldError(
				"Esquila: longitud de fibra",
				"0",
				"Debe ser mayor a 0 cm",
				"5",
			)
		})

		test("rechaza una longitud de fibra mayor a 15 cm", async () => {
			await expectFieldError(
				"Esquila: longitud de fibra",
				"16",
				"No puede superar 15 cm",
				"5",
			)
		})

		test("deriva Se esquila según edad y gestación", async () => {
			await attemptDisabledSelection("Esquila: gestación: Si")
			await expectChecked("Esquila: gestación: No", true)
			await expectChecked("Esquila: esquilado: Si", true)
			await tapLabel("Esquila: sexo: Hembra")
			await tapLabel("Esquila: edad: Adulto")
			await expectEnabled("Esquila: gestación: Si", true)
			await tapLabel("Esquila: gestación: Si")
			await expectChecked("Esquila: esquilado: No", true)
			await tapLabel("Esquila: gestación: Si ultimo tercio")
			await expectChecked("Esquila: esquilado: Si", true)
			await tapLabel("Esquila: edad: Cria")
			await attemptDisabledSelection("Esquila: gestación: Si")
			await expectChecked("Esquila: gestación: No", true)
			await expectChecked("Esquila: esquilado: No", true)
		})

		afterAll(async () => {
			if (!shearingRecordFormPrepared) return
			await device.pressBack()
			await addShearingRecord({
				tagNumber: "950001",
				sex: "Hembra",
				age: "Adulto",
				liveWeight: "38",
				fiberLength: "5",
				condition: "Bueno",
				gestation: "Si ultimo tercio",
				parasites: ["Garrapata"],
				mange: "Leve",
				dandruff: false,
				dead: false,
				observations: "Registro válido tras probar límites",
			})
			await device.pressBack()
			shearingRecordReady = true
		})
	})

	describe("Fibra - información general", () => {
		beforeAll(async () => {
			requireReady(shearingRecordReady, "un registro de esquila válido")
			await openWorkflowStep("Registro de fibra")
			await tapLabel("Abrir Información general")
			await tapLabel("Usar hoy para fecha inicio de fibra")
			await tapLabel("Usar hoy para fecha conclusión de fibra")
			await replaceField("Fibra general: lugar", "Centro validación")
			await replaceField(
				"Fibra general: responsables",
				"Equipo de validación",
			)
			fiberHeaderFormPrepared = true
		})

		test("exige el lugar", async () => {
			await expectFieldError(
				"Fibra general: lugar",
				"   ",
				"Campo requerido",
				"Centro validación",
			)
		})

		test("exige los responsables", async () => {
			await expectFieldError(
				"Fibra general: responsables",
				"   ",
				"Campo requerido",
				"Equipo de validación",
			)
		})

		afterAll(async () => {
			if (!fiberHeaderFormPrepared) return
			await expectEnabled("Guardar información general de fibra", true)
			await tapLabel("Guardar información general de fibra")
			fiberHeaderReady = true
		})
	})

	describe("Fibra - datos iniciales", () => {
		beforeAll(async () => {
			requireReady(fiberHeaderReady, "la información general de fibra")
			await tapLabel("Añadir registro de fibra")
			await replaceField("Fibra: número de vellón", "960001")
			await replaceField("Fibra: peso bruto", "3000")
			fiberCommonFormPrepared = true
		})

		test("rechaza un número de vellón decimal", async () => {
			await expectFieldError(
				"Fibra: número de vellón",
				"1.5",
				"Debe contener solo números enteros",
				"960001",
			)
		})

		test("rechaza un número de vellón igual a cero", async () => {
			await expectFieldError(
				"Fibra: número de vellón",
				"0",
				"Debe ser mayor a 0",
				"960001",
			)
		})

		test("rechaza un peso bruto igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso bruto",
				"0",
				"Debe ser mayor a 0 g",
				"3000",
			)
		})

		test("rechaza un peso bruto mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso bruto",
				"4001",
				"No puede superar 4.000 g",
				"3000",
			)
		})

		afterAll(async () => {
			if (!fiberCommonFormPrepared) return
			await expectEnabled("Guardar registro de fibra", true)
			await tapLabel("Guardar registro de fibra")
			await tapLabel("Continuar registro de fibra 960001")
			fiberCommonReady = true
		})
	})

	describe("Fibra - Limpiado", () => {
		beforeAll(() => {
			requireReady(fiberCommonReady, "los datos iniciales de fibra")
			groomingFormPrepared = true
		})

		test("rechaza un peso de vellón limpio mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso vellón limpio",
				"3001",
				"No puede superar el peso bruto",
				"1800",
			)
		})

		test("rechaza un peso de braga mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso braga",
				"3001",
				"No puede superar el peso bruto",
				"800",
			)
		})

		test("rechaza una suma de pesos mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso braga",
				"1500",
				"La suma de ambos pesos no puede superar el peso bruto",
				"800",
			)
		})

		afterAll(async () => {
			if (!groomingFormPrepared) return
			await expectEnabled("Guardar registro de fibra", true)
			await tapLabel("Guardar registro de fibra")
			groomingReady = true
		})
	})

	describe("Fibra - Predescerdado", () => {
		beforeAll(async () => {
			requireReady(groomingReady, "un registro de Limpiado válido")
			await tapLabel("Añadir registro de fibra")
			await replaceField("Fibra: número de vellón", "960002")
			await replaceField("Fibra: peso bruto", "3000")
			await expectEnabled("Guardar registro de fibra", true)
			await tapLabel("Guardar registro de fibra")
			await tapLabel("Continuar registro de fibra 960002")
			await tapLabel("Fibra: tipo: Predescerdado")
			await replaceField("Fibra: peso predescerdado", "2100")
			await replaceField("Fibra: peso cerda", "350")
			await replaceField(
				"Fibra: nombre del predescerdador",
				"Elena Mamani",
			)
			dehearingFormPrepared = true
		})

		test("rechaza un peso predescerdado igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso predescerdado",
				"0",
				"Debe ser mayor a 0 g",
				"2100",
			)
		})

		test("rechaza un peso predescerdado mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso predescerdado",
				"4001",
				"No puede superar 4.000 g",
				"2100",
			)
		})

		test("rechaza un peso de cerda igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso cerda",
				"0",
				"Debe ser mayor a 0 g",
				"350",
			)
		})

		test("rechaza un peso de cerda mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso cerda",
				"4001",
				"No puede superar 4.000 g",
				"350",
			)
		})

		test("exige el nombre del predescerdador", async () => {
			await expectFieldError(
				"Fibra: nombre del predescerdador",
				"   ",
				"Campo requerido",
				"Elena Mamani",
			)
		})

		test("exige la firma del predescerdador", async () => {
			await drawSignature()
			await tapLabel("Borrar firma")
			await byText("Campo requerido")
			await drawSignature()
			await expectEnabled("Guardar registro de fibra", true)
		})

		afterAll(async () => {
			if (!dehearingFormPrepared) return
			await tapLabel("Guardar registro de fibra")
			await byPressableLabel("Añadir registro de fibra")
		})
	})
})
