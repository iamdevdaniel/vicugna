const { device } = require("detox")
const { describe, test } = require("@jest/globals")
const {
	addFiberRecord,
	addParticipant,
	addShearingRecord,
	expectTotal,
	fillCleaningHeader,
	fillShearingHeader,
	openWorkflowStep,
	verifyCleaningHeader,
	verifyFiberRecord,
	verifyParticipant,
	verifyShearingHeader,
	verifyShearingRecord,
} = require("./flows")
const {
	byText,
	expectEnabled,
	HAPPY_PERMIT,
	openPermit,
	resetLoginAndLoadPermits,
} = require("./support")

const participants = [
	{
		name: "Ana",
		lastNames: "Quispe Flores",
		gender: "Femenino",
		identityNumber: "910001",
		notes: "Participante de prueba uno",
	},
	{
		name: "Luis",
		lastNames: "Mamani Choque",
		gender: "Masculino",
		identityNumber: "910002",
		notes: "Participante de prueba dos",
	},
	{
		name: "Rosa",
		lastNames: "Condori Apaza",
		gender: "Femenino",
		identityNumber: "910003",
		notes: "Participante de prueba tres",
	},
]

const shearingRecords = [
	{
		tagNumber: "920001",
		sex: "Macho",
		age: "Adulto",
		liveWeight: "42.5",
		fiberLength: "4.8",
		condition: "Bueno",
		gestation: "No",
		parasites: [],
		mange: "Ninguna",
		dandruff: false,
		dead: false,
		observations: "Macho adulto sano",
	},
	{
		tagNumber: "920002",
		sex: "Hembra",
		age: "Cria",
		liveWeight: "18",
		fiberLength: "3.2",
		condition: "Regular",
		gestation: "No",
		parasites: ["Garrapata"],
		mange: "Leve",
		dandruff: true,
		dead: false,
		observations: "Cría no esquilada",
	},
	{
		tagNumber: "920003",
		sex: "Hembra",
		age: "Juvenil",
		liveWeight: "28.4",
		fiberLength: "5.1",
		condition: "Malo",
		gestation: "No",
		parasites: ["Piojos"],
		mange: "Moderado",
		dandruff: false,
		dead: false,
		observations: "Hembra juvenil",
	},
	{
		tagNumber: "920004",
		sex: "Hembra",
		age: "Adulto",
		liveWeight: "39.7",
		fiberLength: "6.3",
		condition: "Bueno",
		gestation: "Si",
		parasites: ["Garrapata", "Piojos"],
		mange: "Severo",
		dandruff: true,
		dead: false,
		observations: "Gestación regular, no esquilada",
	},
	{
		tagNumber: "920005",
		sex: "Hembra",
		age: "Adulto",
		liveWeight: "44",
		fiberLength: "7",
		condition: "Regular",
		gestation: "Si ultimo tercio",
		parasites: [],
		mange: "Ninguna",
		dandruff: false,
		dead: true,
		observations: "Último tercio, esquilada",
	},
]

const fiberRecords = [
	{
		fleeceNumber: "930001",
		grossWeight: "3200",
		type: "Limpiado",
		cleanWeight: "2400",
		dirtyWeight: "500",
		totalWeight: "2900",
	},
	{
		fleeceNumber: "930002",
		grossWeight: "2800",
		type: "Limpiado",
		cleanWeight: "2100",
		dirtyWeight: "400",
		totalWeight: "2500",
	},
	{
		fleeceNumber: "930003",
		grossWeight: "3500",
		type: "Limpiado",
		cleanWeight: "2600",
		dirtyWeight: "600",
		totalWeight: "3200",
	},
	{
		fleeceNumber: "930004",
		grossWeight: "3000",
		type: "Predescerdado",
		dehairedWeight: "2200",
		bristleWeight: "350",
		dandruff: false,
		dehairerName: "María Choque",
	},
	{
		fleeceNumber: "930005",
		grossWeight: "2600",
		type: "Predescerdado",
		dehairedWeight: "1900",
		bristleWeight: "300",
		dandruff: true,
		dehairerName: "Juana Quispe",
	},
]

describe("Recolección local completa", () => {
	let completedStage = 0

	function requireStage(stage, description) {
		if (completedStage < stage) {
			throw new Error(`No se pudo preparar el requisito: ${description}`)
		}
	}

	test("restablece los datos, inicia sesión y abre TEST-01", async () => {
		await resetLoginAndLoadPermits()
		await openPermit(HAPPY_PERMIT)
		completedStage = 1
	})

	test("guarda y verifica tres participantes", async () => {
		requireStage(1, "abrir TEST-01")
		await openWorkflowStep("Participantes")
		for (const participant of participants)
			await addParticipant(participant)
		await expectTotal(3)
		for (const participant of participants) {
			await verifyParticipant(participant)
		}
		await device.pressBack()
		completedStage = 2
	})

	test("guarda y verifica la información y los registros de esquila", async () => {
		requireStage(2, "guardar los participantes")
		await openWorkflowStep("Esquila")
		const shearingDate = await fillShearingHeader()
		await verifyShearingHeader(shearingDate)
		for (const record of shearingRecords) await addShearingRecord(record)
		await expectTotal(5)
		for (const record of shearingRecords) await verifyShearingRecord(record)
		await device.pressBack()
		completedStage = 3
	})

	test("guarda y verifica la información y los registros de fibra", async () => {
		requireStage(3, "completar Esquila")
		await openWorkflowStep("Registro de fibra")
		const cleaningDates = await fillCleaningHeader()
		await verifyCleaningHeader(cleaningDates)
		for (const record of fiberRecords) await addFiberRecord(record)
		await expectTotal(5)
		for (const record of fiberRecords) await verifyFiberRecord(record)
		await device.pressBack()
		completedStage = 4
	})

	test("deja el permiso listo para sincronizar sin enviarlo", async () => {
		requireStage(4, "completar Registro de fibra")
		await byText(
			"Finaliza este permiso cuando ya no queden cambios por hacer.",
		)
		await expectEnabled("Finalizar y enviar", true)
	})
})
