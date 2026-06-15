import { type Model, Q } from "@nozbe/watermelondb"
import type {
	BasicInfoModel,
	CleaningHeaderModel,
	ShearingHeaderModel,
} from "./models"
import { database } from "./setup"

let initializingPermits = false

export async function initializePermits(permitIds: string[]): Promise<void> {
	if (initializingPermits) return
	initializingPermits = true
	try {
		const existingBasic = await database
			.get<BasicInfoModel>("basicInfo")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingBasicIds = new Set(existingBasic.map((r) => r.permitId))
		const missingBasic = permitIds.filter((id) => !existingBasicIds.has(id))

		const existingHeader = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingHeaderIds = new Set(existingHeader.map((r) => r.permitId))
		const missingHeader = permitIds.filter(
			(id) => !existingHeaderIds.has(id),
		)

		const existingCleaningHeader = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingCleaningHeaderIds = new Set(
			existingCleaningHeader.map((r) => r.permitId),
		)
		const missingCleaningHeader = permitIds.filter(
			(id) => !existingCleaningHeaderIds.has(id),
		)

		if (
			missingBasic.length === 0 &&
			missingHeader.length === 0 &&
			missingCleaningHeader.length === 0
		) {
			return
		}

		await database.write(async () => {
			const batchOps: Model[] = []

			missingBasic.forEach((permitId) => {
				batchOps.push(
					database
						.get<BasicInfoModel>("basicInfo")
						.prepareCreate((model) => {
							model.permitId = permitId
							model.department = ""
							model.regional = ""
							model.community = ""
							model.site = ""
							model.date = ""
							model.isCompleted = false
						}),
				)
			})

			missingHeader.forEach((permitId) => {
				batchOps.push(
					database
						.get<ShearingHeaderModel>("shearingHeader")
						.prepareCreate((model) => {
							model.permitId = permitId
							model.site = ""
							model.latitude = 0
							model.longitude = 0
							model.roundupCount = 0
							model.startTime = ""
							model.endTime = ""
							model.isCompleted = false
						}),
				)
			})

			missingCleaningHeader.forEach((permitId) => {
				batchOps.push(
					database
						.get<CleaningHeaderModel>("cleaningHeader")
						.prepareCreate((model) => {
							model.permitId = permitId
							model.startDate = ""
							model.endDate = ""
							model.site = ""
							model.supervisors = ""
							model.isCompleted = false
						}),
				)
			})

			await database.batch(...batchOps)
		})
	} finally {
		initializingPermits = false
	}
}
