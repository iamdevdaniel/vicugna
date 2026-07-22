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
