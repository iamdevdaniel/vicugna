import { type Model, Q } from "@nozbe/watermelondb"
import { calculateTotalWeight } from "@utils/grooming-record-rules"
import {
	deriveIsSheared,
	normalizeGestationStatus,
} from "@utils/shearing-record-rules"
import { updatePermitSyncStatus } from "./dal-permit"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
	ParticipantModel,
	PermitModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"
import { database } from "./setup"

const DEV_SIGNATURE = JSON.stringify([
	"M 30 64 C 43 22 58 23 67 65 C 74 89 87 38 101 47 C 114 56 119 75 133 67 C 148 58 154 35 166 46 C 178 57 184 73 198 64 C 213 54 220 38 232 49 C 244 60 253 68 276 53",
	"M 35 82 C 102 76 184 84 284 75",
])

export async function clearPermitFieldData(permitId: string): Promise<void> {
	await database.write(async () => {
		const participants = await database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.fetch()
		const shearingRecords = await database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.fetch()
		const cleaningCommonRecords = await database
			.get<CleaningCommonModel>("cleaningCommon")
			.query(Q.where("permitId", permitId))
			.fetch()
		const cleaningCommonIds = cleaningCommonRecords.map(
			(record) => record.id,
		)
		const groomingRecords =
			cleaningCommonIds.length > 0
				? await database
						.get<GroomingModel>("grooming")
						.query(
							Q.where(
								"cleaningCommonId",
								Q.oneOf(cleaningCommonIds),
							),
						)
						.fetch()
				: []
		const dehearingRecords =
			cleaningCommonIds.length > 0
				? await database
						.get<DehearingModel>("dehearing")
						.query(
							Q.where(
								"cleaningCommonId",
								Q.oneOf(cleaningCommonIds),
							),
						)
						.fetch()
				: []
		const shearingHeaders = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		const cleaningHeaders = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		const permit = await database.get<PermitModel>("permits").find(permitId)

		const batchOps: Model[] = [
			...participants.map((record) => record.prepareDestroyPermanently()),
			...shearingRecords.map((record) =>
				record.prepareDestroyPermanently(),
			),
			...groomingRecords.map((record) =>
				record.prepareDestroyPermanently(),
			),
			...dehearingRecords.map((record) =>
				record.prepareDestroyPermanently(),
			),
			...cleaningCommonRecords.map((record) =>
				record.prepareDestroyPermanently(),
			),
		]

		const shearingHeader = shearingHeaders[0]
		if (shearingHeader) {
			batchOps.push(
				shearingHeader.prepareUpdate((model) => {
					model.site = ""
					model.latitude = 0
					model.longitude = 0
					model.roundupCount = 0
					model.eventDate = ""
					model.startTime = ""
					model.endTime = ""
					model.isCompleted = false
				}),
			)
		}

		const cleaningHeader = cleaningHeaders[0]
		if (cleaningHeader) {
			batchOps.push(
				cleaningHeader.prepareUpdate((model) => {
					model.startDate = ""
					model.endDate = ""
					model.site = ""
					model.supervisors = ""
					model.isCompleted = false
				}),
			)
		}

		batchOps.push(
			permit.prepareUpdate((model) => {
				model.participantsStatus = "ready"
				model.shearingStatus = "disabled"
				model.cleaningStatus = "disabled"
			}),
		)

		await database.batch(batchOps)
	})

	await updatePermitSyncStatus({
		permitId,
		syncStatus: "assigned",
		syncedAt: null,
		syncVersion: null,
	})
}

export async function seedPermitFieldData(permitId: string): Promise<void> {
	await clearPermitFieldData(permitId)

	await database.write(async () => {
		const shearingHeaders = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		const cleaningHeaders = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		const permit = await database.get<PermitModel>("permits").find(permitId)

		const batchOps: Model[] = []

		const shearingHeader = shearingHeaders[0]
		if (shearingHeader) {
			batchOps.push(
				shearingHeader.prepareUpdate((model) => {
					model.site = "Corral central"
					model.latitude = -16.533
					model.longitude = -68.087
					model.roundupCount = 42
					model.eventDate = "24/07/2026"
					model.startTime = "07:30"
					model.endTime = "12:15"
					model.isCompleted = true
				}),
			)
		}

		const cleaningHeader = cleaningHeaders[0]
		if (cleaningHeader) {
			batchOps.push(
				cleaningHeader.prepareUpdate((model) => {
					model.startDate = "2026-07-22"
					model.endDate = "2026-07-22"
					model.site = "Galpon comunal"
					model.supervisors = "Equipo local"
					model.isCompleted = true
				}),
			)
		}

		const seededCleaningCommonIds: string[] = []

		const participantSeeds = [
			{
				name: "Juana",
				lastNames: "Quispe Mamani",
				gender: "F" as const,
				identityNumber: "1001001",
			},
			{
				name: "Rene",
				lastNames: "Choque Condori",
				gender: "M" as const,
				identityNumber: "1001002",
			},
			{
				name: "Lucia",
				lastNames: "Apaza Vilca",
				gender: "F" as const,
				identityNumber: "1001003",
			},
			{
				name: "Mario",
				lastNames: "Mamani Ticona",
				gender: "M" as const,
				identityNumber: "1001004",
			},
			{
				name: "Elena",
				lastNames: "Condori Flores",
				gender: "F" as const,
				identityNumber: "1001005",
			},
			{
				name: "Victor",
				lastNames: "Huanca Quispe",
				gender: "M" as const,
				identityNumber: "1001006",
			},
			{
				name: "Rosa",
				lastNames: "Callisaya Mamani",
				gender: "F" as const,
				identityNumber: "1001007",
			},
			{
				name: "David",
				lastNames: "Yujra Condori",
				gender: "M" as const,
				identityNumber: "1001008",
			},
			{
				name: "Julia",
				lastNames: "Vilca Apaza",
				gender: "F" as const,
				identityNumber: "1001009",
			},
			{
				name: "Oscar",
				lastNames: "Llanque Choque",
				gender: "M" as const,
				identityNumber: "1001010",
			},
			{
				name: "Marta",
				lastNames: "Ticona Quispe",
				gender: "F" as const,
				identityNumber: "1001011",
			},
			{
				name: "Hugo",
				lastNames: "Mamani Apaza",
				gender: "M" as const,
				identityNumber: "1001012",
			},
			{
				name: "Sonia",
				lastNames: "Condori Mamani",
				gender: "F" as const,
				identityNumber: "1001013",
			},
			{
				name: "Luis",
				lastNames: "Quisbert Choque",
				gender: "M" as const,
				identityNumber: "1001014",
			},
			{
				name: "Celia",
				lastNames: "Apaza Condori",
				gender: "F" as const,
				identityNumber: "1001015",
			},
			{
				name: "Edgar",
				lastNames: "Mamani Quispe",
				gender: "M" as const,
				identityNumber: "1001016",
			},
			{
				name: "Nelly",
				lastNames: "Flores Yujra",
				gender: "F" as const,
				identityNumber: "1001017",
			},
			{
				name: "Jaime",
				lastNames: "Huanca Mamani",
				gender: "M" as const,
				identityNumber: "1001018",
			},
			{
				name: "Patricia",
				lastNames: "Vilca Quisbert",
				gender: "F" as const,
				identityNumber: "1001019",
			},
			{
				name: "Rolando",
				lastNames: "Choque Apaza",
				gender: "M" as const,
				identityNumber: "1001020",
			},
			{
				name: "Gloria",
				lastNames: "Ticona Flores",
				gender: "F" as const,
				identityNumber: "1001021",
			},
			{
				name: "Wilson",
				lastNames: "Condori Ticona",
				gender: "M" as const,
				identityNumber: "1001022",
			},
			{
				name: "Bertha",
				lastNames: "Mamani Vilca",
				gender: "F" as const,
				identityNumber: "1001023",
			},
			{
				name: "Freddy",
				lastNames: "Quispe Callisaya",
				gender: "M" as const,
				identityNumber: "1001024",
			},
			{
				name: "Silvia",
				lastNames: "Yujra Choque",
				gender: "F" as const,
				identityNumber: "1001025",
			},
			{
				name: "Jhonny",
				lastNames: "Apaza Mamani",
				gender: "M" as const,
				identityNumber: "1001026",
			},
			{
				name: "Teresa",
				lastNames: "Huanca Condori",
				gender: "F" as const,
				identityNumber: "1001027",
			},
			{
				name: "Gustavo",
				lastNames: "Llanque Quispe",
				gender: "M" as const,
				identityNumber: "1001028",
			},
			{
				name: "Ruth",
				lastNames: "Mamani Yujra",
				gender: "F" as const,
				identityNumber: "1001029",
			},
			{
				name: "Cesar",
				lastNames: "Choque Vilca",
				gender: "M" as const,
				identityNumber: "1001030",
			},
			{
				name: "Yesenia",
				lastNames: "Condori Apaza",
				gender: "F" as const,
				identityNumber: "1001031",
			},
			{
				name: "Alfredo",
				lastNames: "Quisbert Mamani",
				gender: "M" as const,
				identityNumber: "1001032",
			},
			{
				name: "Noemi",
				lastNames: "Flores Quispe",
				gender: "F" as const,
				identityNumber: "1001033",
			},
			{
				name: "Roberto",
				lastNames: "Ticona Huanca",
				gender: "M" as const,
				identityNumber: "1001034",
			},
			{
				name: "Carla",
				lastNames: "Vilca Mamani",
				gender: "F" as const,
				identityNumber: "1001035",
			},
			{
				name: "Samuel",
				lastNames: "Yujra Quisbert",
				gender: "M" as const,
				identityNumber: "1001036",
			},
			{
				name: "Nancy",
				lastNames: "Apaza Flores",
				gender: "F" as const,
				identityNumber: "1001037",
			},
			{
				name: "Jorge",
				lastNames: "Condori Choque",
				gender: "M" as const,
				identityNumber: "1001038",
			},
			{
				name: "Felipa",
				lastNames: "Mamani Callisaya",
				gender: "F" as const,
				identityNumber: "1001039",
			},
			{
				name: "Ivan",
				lastNames: "Huanca Apaza",
				gender: "M" as const,
				identityNumber: "1001040",
			},
			{
				name: "Marisol",
				lastNames: "Quispe Vilca",
				gender: "F" as const,
				identityNumber: "1001041",
			},
			{
				name: "Richard",
				lastNames: "Choque Mamani",
				gender: "M" as const,
				identityNumber: "1001042",
			},
			{
				name: "Rosmery",
				lastNames: "Yujra Flores",
				gender: "F" as const,
				identityNumber: "1001043",
			},
			{
				name: "Boris",
				lastNames: "Ticona Condori",
				gender: "M" as const,
				identityNumber: "1001044",
			},
			{
				name: "Lidia",
				lastNames: "Apaza Quispe",
				gender: "F" as const,
				identityNumber: "1001045",
			},
			{
				name: "Milton",
				lastNames: "Mamani Huanca",
				gender: "M" as const,
				identityNumber: "1001046",
			},
			{
				name: "Anabel",
				lastNames: "Vilca Condori",
				gender: "F" as const,
				identityNumber: "1001047",
			},
			{
				name: "Cristian",
				lastNames: "Quisbert Apaza",
				gender: "M" as const,
				identityNumber: "1001048",
			},
			{
				name: "Doris",
				lastNames: "Flores Mamani",
				gender: "F" as const,
				identityNumber: "1001049",
			},
			{
				name: "Armando",
				lastNames: "Choque Quispe",
				gender: "M" as const,
				identityNumber: "1001050",
			},
			{
				name: "Miriam",
				lastNames: "Condori Yujra",
				gender: "F" as const,
				identityNumber: "1001051",
			},
			{
				name: "Nestor",
				lastNames: "Huanca Vilca",
				gender: "M" as const,
				identityNumber: "1001052",
			},
			{
				name: "Paola",
				lastNames: "Mamani Quisbert",
				gender: "F" as const,
				identityNumber: "1001053",
			},
			{
				name: "Ruben",
				lastNames: "Apaza Ticona",
				gender: "M" as const,
				identityNumber: "1001054",
			},
			{
				name: "Viviana",
				lastNames: "Choque Flores",
				gender: "F" as const,
				identityNumber: "1001055",
			},
			{
				name: "Efrain",
				lastNames: "Quispe Condori",
				gender: "M" as const,
				identityNumber: "1001056",
			},
			{
				name: "Claudia",
				lastNames: "Yujra Mamani",
				gender: "F" as const,
				identityNumber: "1001057",
			},
			{
				name: "Percy",
				lastNames: "Vilca Huanca",
				gender: "M" as const,
				identityNumber: "1001058",
			},
			{
				name: "Daniela",
				lastNames: "Apaza Quisbert",
				gender: "F" as const,
				identityNumber: "1001059",
			},
			{
				name: "Mauricio",
				lastNames: "Condori Mamani",
				gender: "M" as const,
				identityNumber: "1001060",
			},
		]

		for (const seed of participantSeeds) {
			batchOps.push(
				database
					.get<ParticipantModel>("participants")
					.prepareCreate((model) => {
						model.permitId = permitId
						model.name = seed.name
						model.lastNames = seed.lastNames
						model.gender = seed.gender
						model.identityNumber = seed.identityNumber
						model.signature = DEV_SIGNATURE
						model.notes = ""
					}),
			)
		}

		const shearingSeeds = Array.from({ length: 400 }, (_, index) => {
			const recordNumber = index + 1
			const sex = recordNumber % 2 === 0 ? ("M" as const) : ("F" as const)
			const ageCategory =
				recordNumber % 3 === 0
					? ("Cria" as const)
					: recordNumber % 3 === 1
						? ("Juvenil" as const)
						: ("Adulto" as const)
			const gestationStatus = normalizeGestationStatus(
				sex,
				ageCategory,
				recordNumber % 5 === 0
					? "Si"
					: recordNumber % 5 === 1
						? "No"
						: "Si ultimo tercio",
			)

			return {
				tagNumber: 100 + recordNumber,
				sex,
				ageCategory,
				liveWeight: 35 + (recordNumber % 18) + (recordNumber % 10) / 10,
				fiberLength: 7 + (recordNumber % 5) + (recordNumber % 10) / 10,
				bodyCondition:
					recordNumber % 3 === 0
						? ("Malo" as const)
						: recordNumber % 3 === 1
							? ("Regular" as const)
							: ("Bueno" as const),
				gestationStatus,
				externalParasites:
					recordNumber % 3 === 0
						? ("Garrapata" as const)
						: recordNumber % 3 === 1
							? ("Piojos" as const)
							: ("Ninguno" as const),
				mangeSeverity:
					recordNumber % 4 === 0
						? ("Leve" as const)
						: recordNumber % 4 === 1
							? ("Moderado" as const)
							: recordNumber % 4 === 2
								? ("Severo" as const)
								: ("Ninguna" as const),
				hasDandruff: recordNumber % 5 === 0,
				isSheared: deriveIsSheared(ageCategory, gestationStatus),
				isDead: recordNumber % 25 === 0,
				observations: recordNumber % 10 === 0 ? "Con observacion" : "",
			}
		})

		for (const seed of shearingSeeds) {
			batchOps.push(
				database
					.get<ShearingRecordModel>("shearingRecord")
					.prepareCreate((model) => {
						model.permitId = permitId
						model.tagNumber = seed.tagNumber
						model.sex = seed.sex
						model.ageCategory = seed.ageCategory
						model.liveWeight = seed.liveWeight
						model.fiberLength = seed.fiberLength
						model.bodyCondition = seed.bodyCondition
						model.gestationStatus = seed.gestationStatus
						model.externalParasites = seed.externalParasites
						model.mangeSeverity = seed.mangeSeverity
						model.hasDandruff = seed.hasDandruff
						model.isSheared = seed.isSheared
						model.isDead = seed.isDead
						model.observations = seed.observations
					}),
			)
		}

		const cleaningSeeds = [
			{
				fleeceNumber: "1",
				grossWeight: 3.4,
				kind: "grooming" as const,
			},
			{
				fleeceNumber: "2",
				grossWeight: 3.1,
				kind: "dehearing" as const,
			},
			{
				fleeceNumber: "3",
				grossWeight: 3.7,
				kind: "grooming" as const,
			},
		]

		for (const seed of cleaningSeeds) {
			const record = database
				.get<CleaningCommonModel>("cleaningCommon")
				.prepareCreate((model) => {
					model.permitId = permitId
					model.fleeceNumber = seed.fleeceNumber
					model.grossWeight = seed.grossWeight
				})
			seededCleaningCommonIds.push(record.id)
			batchOps.push(record)
		}

		for (const [
			index,
			cleaningCommonId,
		] of seededCleaningCommonIds.entries()) {
			if (cleaningSeeds[index].kind === "grooming") {
				const cleanWeight = (24 + index * 2) / 10
				const dirtyWeight = 0.5
				const totalWeight = Number(
					calculateTotalWeight(
						cleanWeight.toString(),
						dirtyWeight.toString(),
					),
				)
				batchOps.push(
					database
						.get<GroomingModel>("grooming")
						.prepareCreate((model) => {
							model.cleaningCommonId = cleaningCommonId
							model.cleanWeight = cleanWeight
							model.dirtyWeight = dirtyWeight
							model.totalWeight = totalWeight
							model.isCompleted = true
						}),
				)
			} else {
				batchOps.push(
					database
						.get<DehearingModel>("dehearing")
						.prepareCreate((model) => {
							model.cleaningCommonId = cleaningCommonId
							model.dehairedWeight = 1.9
							model.bristleWeight = 0.6
							model.hasDandruff = false
							model.dehairerName = "Equipo local"
							model.signature = DEV_SIGNATURE
							model.isCompleted = true
						}),
				)
			}
		}

		batchOps.push(
			permit.prepareUpdate((model) => {
				model.participantsStatus = "done"
				model.shearingStatus = "done"
				model.cleaningStatus = "done"
			}),
		)

		await database.batch(batchOps)
	})
}
