import { Q } from "@nozbe/watermelondb"
import type {
	BasicInfoModel,
	CleaningHeaderModel,
	ParticipantModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"
import { database } from "./setup"

export async function seedPermitBeforeCleaningRecords(
	permitId: string,
): Promise<void> {
	if (!__DEV__) return

	await database.write(async () => {
		const basicInfo = await database
			.get<BasicInfoModel>("basicInfo")
			.query(Q.where("permitId", permitId))
			.fetch()
		for (const record of basicInfo) {
			await record.update((model) => {
				model.department = "La Paz"
				model.regional = "Altiplano"
				model.community = "Chacaltaya"
				model.site = "Manejo Norte"
				model.date = "2026-06-11"
				model.isCompleted = true
			})
		}

		const shearingHeaders = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		for (const record of shearingHeaders) {
			await record.update((model) => {
				model.site = "Corral 1"
				model.latitude = -16.5
				model.longitude = -68.15
				model.roundupCount = 18
				model.startTime = "08:30"
				model.endTime = "12:10"
				model.isCompleted = true
			})
		}

		const cleaningHeaders = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch()
		for (const record of cleaningHeaders) {
			await record.update((model) => {
				model.startDate = "2026-06-12"
				model.endDate = "2026-06-12"
				model.site = "Sala de limpieza"
				model.supervisors = "Maria Quispe, Luis Mamani"
				model.isCompleted = true
			})
		}

		const participants = await database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.fetch()
		if (participants.length === 0) {
			await database
				.get<ParticipantModel>("participants")
				.create((model) => {
					model.permitId = permitId
					model.name = "Maria"
					model.lastNames = "Quispe"
					model.gender = "F"
					model.identityNumber = "1234567"
					model.signature = ""
					model.notes = "Responsable"
				})
			await database
				.get<ParticipantModel>("participants")
				.create((model) => {
					model.permitId = permitId
					model.name = "Luis"
					model.lastNames = "Mamani"
					model.gender = "M"
					model.identityNumber = "7654321"
					model.signature = ""
					model.notes = "Apoyo"
				})
		}

		const shearingRecords = await database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.fetch()
		if (shearingRecords.length === 0) {
			const shearingCollection =
				database.get<ShearingRecordModel>("shearingRecord")
			await shearingCollection.create((model) => {
				model.permitId = permitId
				model.tagNumber = 12233
				model.sex = "M"
				model.ageCategory = "Adulto"
				model.liveWeight = 48
				model.fiberLength = 8
				model.bodyCondition = "Bueno"
				model.gestationStatus = "No"
				model.externalParasites = "Ninguno"
				model.mangeSeverity = "Ninguna"
				model.hasDandruff = false
				model.isSheared = true
				model.isDead = false
				model.observations = ""
			})
			await shearingCollection.create((model) => {
				model.permitId = permitId
				model.tagNumber = 12234
				model.sex = "F"
				model.ageCategory = "Adulto"
				model.liveWeight = 42
				model.fiberLength = 7
				model.bodyCondition = "Regular"
				model.gestationStatus = "Si"
				model.externalParasites = "Piojos"
				model.mangeSeverity = "Leve"
				model.hasDandruff = true
				model.isSheared = true
				model.isDead = false
				model.observations = ""
			})
		}
	})
}
