import {
	addParticipant,
	addShearingRecord,
	openWorkflowStep,
} from "./flows.mjs"
import {
	byLabel,
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
} from "./support.mjs"

async function hideKeyboard() {
	await browser.hideKeyboard().catch(() => false)
}

async function expectFieldError(field, value, message, validValue) {
	try {
		await replaceField(browser, field, value)
		await hideKeyboard()
		await byText(browser, message)
	} finally {
		await replaceField(browser, field, validValue)
		await hideKeyboard()
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
		await replaceField(browser, field, rejectedValue)
		await hideKeyboard()
		await byText(browser, rejectedMessage)
		await expectEnabled(
			browser,
			"Guardar información general de esquila",
			false,
		)

		await replaceField(browser, field, boundaryValue)
		await hideKeyboard()
		await expectEnabled(
			browser,
			"Guardar información general de esquila",
			true,
		)
	} finally {
		await replaceField(browser, field, validValue)
		await hideKeyboard()
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

	before(async () => {
		await resetLoginAndLoadPermits(browser)
		await openPermit(browser, VALIDATION_PERMIT)
	})

	describe("Participantes", () => {
		before(async () => {
			await openWorkflowStep(browser, "Participantes")
			await tapLabel(browser, "Añadir participante")
			participantFormPrepared = true
		})

		it("exige el nombre", async () => {
			await expectFieldError(
				"Participante: nombre",
				"   ",
				"Requerido",
				"Eva",
			)
		})

		it("exige los apellidos", async () => {
			await expectFieldError(
				"Participante: apellidos",
				"   ",
				"Requerido",
				"Flores Lima",
			)
		})

		it("rechaza una cédula decimal", async () => {
			await expectFieldError(
				"Participante: cédula",
				"1.5",
				"Debe contener solo números enteros",
				"940001",
			)
		})

		it("rechaza una cédula igual a cero", async () => {
			try {
				await replaceField(browser, "Participante: cédula", "0")
				await hideKeyboard()
				await byText(browser, "Debe ser mayor a 0")
				await expectEnabled(browser, "Guardar participante", false)
			} finally {
				await replaceField(browser, "Participante: cédula", "940001")
				await hideKeyboard()
			}
		})

		after(async () => {
			if (!participantFormPrepared) return
			await browser.back()
			await addParticipant(browser, {
				name: "Eva",
				lastNames: "Flores Lima",
				gender: "Femenino",
				identityNumber: "940001",
				notes: "Participante para validaciones",
			})
			await browser.back()
			participantReady = true
		})
	})

	describe("Esquila - información general", () => {
		before(async function () {
			if (!participantReady) this.skip()
			await openWorkflowStep(browser, "Esquila")
			await tapLabel(browser, "Abrir Información general")
			await replaceField(
				browser,
				"Esquila general: sitio",
				"Corral validación",
			)
			await replaceField(browser, "Esquila general: latitud", "-21.5")
			await replaceField(browser, "Esquila general: longitud", "-67.1")
			await replaceField(
				browser,
				"Esquila general: cantidad de arreos",
				"5",
			)
			await hideKeyboard()
			await tapLabel(browser, "Usar hoy para fecha de esquila")
			await setTime(browser, "Esquila general: hora inicial", 10, 0)
			await setTime(browser, "Esquila general: hora conclusión", 11, 0)
			shearingHeaderFormPrepared = true
		})

		it("exige el sitio", async () => {
			await expectFieldError(
				"Esquila general: sitio",
				"   ",
				"Campo requerido",
				"Corral validación",
			)
		})

		it("rechaza una latitud no numérica", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"abc",
				"Debe ser un número",
				"-21.5",
			)
		})

		it("rechaza una latitud menor que -90", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"-91",
				"No puede ser menor a -90",
				"-21.5",
			)
		})

		it("rechaza una latitud mayor que 90", async () => {
			await expectFieldError(
				"Esquila general: latitud",
				"91",
				"No puede superar 90",
				"-21.5",
			)
		})

		it("acepta los límites exactos de latitud", async () => {
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

		it("rechaza una longitud menor que -180", async () => {
			await expectFieldError(
				"Esquila general: longitud",
				"-181",
				"No puede ser menor a -180",
				"-67.1",
			)
		})

		it("rechaza una longitud mayor que 180", async () => {
			await expectFieldError(
				"Esquila general: longitud",
				"181",
				"No puede superar 180",
				"-67.1",
			)
		})

		it("acepta los límites exactos de longitud", async () => {
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

		it("rechaza una cantidad de arreos decimal", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"1.5",
				"Debe contener solo números enteros",
				"5",
			)
		})

		it("rechaza una cantidad de arreos igual a cero", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"0",
				"Debe ser mayor a 0",
				"5",
			)
		})

		it("rechaza más de 100 arreos", async () => {
			await expectFieldError(
				"Esquila general: cantidad de arreos",
				"101",
				"No puede superar 100",
				"5",
			)
		})

		it("exige que la hora final sea posterior", async () => {
			try {
				await setTime(browser, "Esquila general: hora conclusión", 8, 0)
				await byText(browser, "La hora final debe ir después")
				await expectEnabled(
					browser,
					"Guardar información general de esquila",
					false,
				)
			} finally {
				await setTime(
					browser,
					"Esquila general: hora conclusión",
					11,
					0,
				)
			}
		})

		after(async () => {
			if (!shearingHeaderFormPrepared) return
			await expectEnabled(
				browser,
				"Guardar información general de esquila",
				true,
			)
			await tapLabel(browser, "Guardar información general de esquila")
			shearingHeaderReady = true
		})
	})

	describe("Esquila - registro", () => {
		before(async function () {
			if (!shearingHeaderReady) this.skip()
			await tapLabel(browser, "Añadir registro de esquila")
			await replaceField(browser, "Esquila: número de arete", "950001")
			await replaceField(browser, "Esquila: peso vivo", "38")
			await replaceField(browser, "Esquila: longitud de fibra", "5")
			await hideKeyboard()
			shearingRecordFormPrepared = true
		})

		it("rechaza un número de arete decimal", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"1.5",
				"Debe contener solo números enteros",
				"950001",
			)
		})

		it("rechaza un número de arete igual a cero", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"0",
				"Debe ser mayor a 0",
				"950001",
			)
		})

		it("rechaza un número de arete mayor al límite", async () => {
			await expectFieldError(
				"Esquila: número de arete",
				"2147483648",
				"No puede superar 2.147.483.647",
				"950001",
			)
		})

		it("rechaza un peso vivo igual a cero", async () => {
			await expectFieldError(
				"Esquila: peso vivo",
				"0",
				"Debe ser mayor a 0 kg",
				"38",
			)
		})

		it("rechaza un peso vivo mayor a 100 kg", async () => {
			await expectFieldError(
				"Esquila: peso vivo",
				"101",
				"No puede superar 100 kg",
				"38",
			)
		})

		it("rechaza una longitud de fibra igual a cero", async () => {
			await expectFieldError(
				"Esquila: longitud de fibra",
				"0",
				"Debe ser mayor a 0 cm",
				"5",
			)
		})

		it("rechaza una longitud de fibra mayor a 15 cm", async () => {
			await expectFieldError(
				"Esquila: longitud de fibra",
				"16",
				"No puede superar 15 cm",
				"5",
			)
		})

		it("deriva Se esquila según edad y gestación", async () => {
			await expectEnabled(browser, "Esquila: gestación: Si", false)
			await expectChecked(browser, "Esquila: esquilado: Si", true)
			await tapLabel(browser, "Esquila: sexo: Hembra")
			await tapLabel(browser, "Esquila: edad: Adulto")
			await expectEnabled(browser, "Esquila: gestación: Si", true)
			await tapLabel(browser, "Esquila: gestación: Si")
			await expectChecked(browser, "Esquila: esquilado: No", true)
			await tapLabel(browser, "Esquila: gestación: Si ultimo tercio")
			await expectChecked(browser, "Esquila: esquilado: Si", true)
			await tapLabel(browser, "Esquila: edad: Cria")
			await expectEnabled(browser, "Esquila: gestación: Si", false)
			await expectChecked(browser, "Esquila: esquilado: No", true)
		})

		after(async () => {
			if (!shearingRecordFormPrepared) return
			await browser.back()
			await addShearingRecord(browser, {
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
			await browser.back()
			shearingRecordReady = true
		})
	})

	describe("Fibra - información general", () => {
		before(async function () {
			if (!shearingRecordReady) this.skip()
			await openWorkflowStep(browser, "Registro de fibra")
			await tapLabel(browser, "Abrir Información general")
			await tapLabel(browser, "Usar hoy para fecha inicio de fibra")
			await tapLabel(browser, "Usar hoy para fecha conclusión de fibra")
			await replaceField(
				browser,
				"Fibra general: lugar",
				"Centro validación",
			)
			await replaceField(
				browser,
				"Fibra general: responsables",
				"Equipo de validación",
			)
			await hideKeyboard()
			fiberHeaderFormPrepared = true
		})

		it("exige el lugar", async () => {
			await expectFieldError(
				"Fibra general: lugar",
				"   ",
				"Campo requerido",
				"Centro validación",
			)
		})

		it("exige los responsables", async () => {
			await expectFieldError(
				"Fibra general: responsables",
				"   ",
				"Campo requerido",
				"Equipo de validación",
			)
		})

		after(async () => {
			if (!fiberHeaderFormPrepared) return
			await expectEnabled(
				browser,
				"Guardar información general de fibra",
				true,
			)
			await tapLabel(browser, "Guardar información general de fibra")
			fiberHeaderReady = true
		})
	})

	describe("Fibra - datos iniciales", () => {
		before(async function () {
			if (!fiberHeaderReady) this.skip()
			await tapLabel(browser, "Añadir registro de fibra")
			await replaceField(browser, "Fibra: número de vellón", "960001")
			await replaceField(browser, "Fibra: peso bruto", "3000")
			await hideKeyboard()
			fiberCommonFormPrepared = true
		})

		it("rechaza un número de vellón decimal", async () => {
			await expectFieldError(
				"Fibra: número de vellón",
				"1.5",
				"Debe contener solo números enteros",
				"960001",
			)
		})

		it("rechaza un número de vellón igual a cero", async () => {
			await expectFieldError(
				"Fibra: número de vellón",
				"0",
				"Debe ser mayor a 0",
				"960001",
			)
		})

		it("rechaza un peso bruto igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso bruto",
				"0",
				"Debe ser mayor a 0 g",
				"3000",
			)
		})

		it("rechaza un peso bruto mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso bruto",
				"4001",
				"No puede superar 4.000 g",
				"3000",
			)
		})

		after(async () => {
			if (!fiberCommonFormPrepared) return
			await expectEnabled(browser, "Guardar registro de fibra", true)
			await tapLabel(browser, "Guardar registro de fibra")
			await tapLabel(browser, "Continuar registro de fibra 960001")
			fiberCommonReady = true
		})
	})

	describe("Fibra - Limpiado", () => {
		before(function () {
			if (!fiberCommonReady) this.skip()
			groomingFormPrepared = true
		})

		it("rechaza un peso de vellón limpio mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso vellón limpio",
				"3001",
				"No puede superar el peso bruto",
				"1800",
			)
		})

		it("rechaza un peso de braga mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso braga",
				"3001",
				"No puede superar el peso bruto",
				"800",
			)
		})

		it("rechaza una suma de pesos mayor al peso bruto", async () => {
			await expectFieldError(
				"Fibra: peso braga",
				"1500",
				"La suma de ambos pesos no puede superar el peso bruto",
				"800",
			)
		})

		after(async () => {
			if (!groomingFormPrepared) return
			await expectEnabled(browser, "Guardar registro de fibra", true)
			await tapLabel(browser, "Guardar registro de fibra")
			groomingReady = true
		})
	})

	describe("Fibra - Predescerdado", () => {
		before(async function () {
			if (!groomingReady) this.skip()
			await tapLabel(browser, "Añadir registro de fibra")
			await replaceField(browser, "Fibra: número de vellón", "960002")
			await replaceField(browser, "Fibra: peso bruto", "3000")
			await hideKeyboard()
			await expectEnabled(browser, "Guardar registro de fibra", true)
			await tapLabel(browser, "Guardar registro de fibra")
			await tapLabel(browser, "Continuar registro de fibra 960002")
			await tapLabel(browser, "Fibra: tipo: Predescerdado")
			await replaceField(browser, "Fibra: peso predescerdado", "2100")
			await replaceField(browser, "Fibra: peso cerda", "350")
			await replaceField(
				browser,
				"Fibra: nombre del predescerdador",
				"Elena Mamani",
			)
			await hideKeyboard()
			dehearingFormPrepared = true
		})

		it("rechaza un peso predescerdado igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso predescerdado",
				"0",
				"Debe ser mayor a 0 g",
				"2100",
			)
		})

		it("rechaza un peso predescerdado mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso predescerdado",
				"4001",
				"No puede superar 4.000 g",
				"2100",
			)
		})

		it("rechaza un peso de cerda igual a cero", async () => {
			await expectFieldError(
				"Fibra: peso cerda",
				"0",
				"Debe ser mayor a 0 g",
				"350",
			)
		})

		it("rechaza un peso de cerda mayor a 4.000 g", async () => {
			await expectFieldError(
				"Fibra: peso cerda",
				"4001",
				"No puede superar 4.000 g",
				"350",
			)
		})

		it("exige el nombre del predescerdador", async () => {
			await expectFieldError(
				"Fibra: nombre del predescerdador",
				"   ",
				"Campo requerido",
				"Elena Mamani",
			)
		})

		it("exige la firma del predescerdador", async () => {
			await expectEnabled(browser, "Guardar registro de fibra", false)
			await drawSignature(browser)
			await expectEnabled(browser, "Guardar registro de fibra", true)
		})

		after(async () => {
			if (!dehearingFormPrepared) return
			await tapLabel(browser, "Guardar registro de fibra")
			await byLabel(browser, "Añadir registro de fibra")
		})
	})
})
