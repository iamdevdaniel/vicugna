import {
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
} from "./flows.mjs"
import {
	byText,
	expectEnabled,
	HAPPY_PERMIT,
	openPermit,
	resetLoginAndLoadPermits,
} from "./support.mjs"

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
	it("restablece los datos, inicia sesión y abre TEST-01", async () => {
		await resetLoginAndLoadPermits(browser)
		await openPermit(browser, HAPPY_PERMIT)
	})

	it("guarda y verifica tres participantes", async () => {
		await openWorkflowStep(browser, "Participantes")
		for (const participant of participants)
			await addParticipant(browser, participant)
		await expectTotal(browser, 3)
		for (const participant of participants)
			await verifyParticipant(browser, participant)
		await browser.back()
	})

	it("guarda y verifica la información y los registros de esquila", async () => {
		await openWorkflowStep(browser, "Esquila")
		const shearingDate = await fillShearingHeader(browser)
		await verifyShearingHeader(browser, shearingDate)
		for (const record of shearingRecords)
			await addShearingRecord(browser, record)
		await expectTotal(browser, 5)
		for (const record of shearingRecords)
			await verifyShearingRecord(browser, record)
		await browser.back()
	})

	it("guarda y verifica la información y los registros de fibra", async () => {
		await openWorkflowStep(browser, "Registro de fibra")
		const cleaningDates = await fillCleaningHeader(browser)
		await verifyCleaningHeader(browser, cleaningDates)
		for (const record of fiberRecords) await addFiberRecord(browser, record)
		await expectTotal(browser, 5)
		for (const record of fiberRecords)
			await verifyFiberRecord(browser, record)
		await browser.back()
	})

	it("deja el permiso listo para sincronizar sin enviarlo", async () => {
		await byText(
			browser,
			"Finaliza este permiso cuando ya no queden cambios por hacer.",
		)
		await expectEnabled(browser, "Finalizar y enviar", true)
	})
})
