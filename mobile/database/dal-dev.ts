import { type Model, Q } from "@nozbe/watermelondb"
import { updatePermitSyncStatus } from "./dal-permit"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
	ParticipantModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"
import { database } from "./setup"

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

		for (const record of participants) {
			await record.destroyPermanently()
		}

		for (const record of shearingRecords) {
			await record.destroyPermanently()
		}

		for (const record of groomingRecords) {
			await record.destroyPermanently()
		}

		for (const record of dehearingRecords) {
			await record.destroyPermanently()
		}

		for (const record of cleaningCommonRecords) {
			await record.destroyPermanently()
		}

		const batchOps: Model[] = []

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

		if (batchOps.length > 0) {
			await database.batch(...batchOps)
		}
	})

	await updatePermitSyncStatus({
		permitId,
		isSynced: false,
		syncedAt: null,
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
						model.signature = `${seed.name} ${seed.lastNames}`
						model.notes = ""
					}),
			)
		}

		const shearingSeeds = [
			{
				tagNumber: 101,
				sex: "F" as const,
				ageCategory: "Adulto" as const,
				liveWeight: 46.5,
				fiberLength: 9.2,
			},
			{
				tagNumber: 102,
				sex: "M" as const,
				ageCategory: "Juvenil" as const,
				liveWeight: 42.1,
				fiberLength: 8.7,
			},
			{
				tagNumber: 103,
				sex: "F" as const,
				ageCategory: "Adulto" as const,
				liveWeight: 44.8,
				fiberLength: 9.5,
			},
		]

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
						model.bodyCondition = "Bueno"
						model.gestationStatus = "No"
						model.externalParasites = "Ninguno"
						model.mangeSeverity = "Ninguna"
						model.hasDandruff = false
						model.isSheared = true
						model.isDead = false
						model.observations = ""
					}),
			)
		}

		const cleaningSeeds = [
			{
				fleeceNumber: "V-001",
				grossWeight: 3.4,
				kind: "grooming" as const,
			},
			{
				fleeceNumber: "V-002",
				grossWeight: 3.1,
				kind: "dehearing" as const,
			},
			{
				fleeceNumber: "V-003",
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
				batchOps.push(
					database
						.get<GroomingModel>("grooming")
						.prepareCreate((model) => {
							model.cleaningCommonId = cleaningCommonId
							model.cleanWeight = 2.4 + index * 0.2
							model.dirtyWeight = 0.5
							model.totalWeight = 2.9 + index * 0.2
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
							model.signature = "Equipo local"
							model.isCompleted = true
						}),
				)
			}
		}

		if (batchOps.length > 0) {
			await database.batch(...batchOps)
		}
	})
}
