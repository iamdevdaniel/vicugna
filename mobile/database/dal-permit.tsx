import type { PermitData } from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import { applyPermitToModel, mapToPermit } from "./mappers"
import type {
	BasicInfoModel,
	CleaningHeaderModel,
	PermitModel,
	ShearingHeaderModel,
} from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

let savingPermits = false

//-------------------READ-------------------

export function subscribePermits(
	callbacks: SubscriptionCallback<PermitData[]>,
): () => void {
	const sub = database
		.get<PermitModel>("permits")
		.query(Q.sortBy("permitNumber", Q.asc))
		.observe()
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records.map((record) => mapToPermit(record)),
				),
			error: (error) => callbacks.onError(error as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function savePermits(permits: PermitData[]): Promise<void> {
	if (savingPermits || permits.length === 0) return

	savingPermits = true

	try {
		const permitIds = permits.map((permit) => permit.id)

		const existingPermits = await database
			.get<PermitModel>("permits")
			.query(Q.where("id", Q.oneOf(permitIds)))
			.fetch()
		const existingPermitIds = new Set(
			existingPermits.map((permit) => permit.id),
		)

		const existingBasic = await database
			.get<BasicInfoModel>("basicInfo")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingBasicIds = new Set(
			existingBasic.map((record) => record.permitId),
		)

		const existingHeader = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingHeaderIds = new Set(
			existingHeader.map((record) => record.permitId),
		)

		const existingCleaningHeader = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingCleaningHeaderIds = new Set(
			existingCleaningHeader.map((record) => record.permitId),
		)

		await database.write(async () => {
			const batchOps: Model[] = []

			for (const permit of permits) {
				if (existingPermitIds.has(permit.id)) {
					const record = existingPermits.find(
						(item) => item.id === permit.id,
					)

					if (record) {
						batchOps.push(
							record.prepareUpdate((model) => {
								applyPermitToModel(model, permit)
							}),
						)
					}
				} else {
					batchOps.push(
						database
							.get<PermitModel>("permits")
							.prepareCreate((model) => {
								applyPermitToModel(model, permit)
								model._raw.id = permit.id
							}),
					)
				}

				if (!existingBasicIds.has(permit.id)) {
					batchOps.push(
						database
							.get<BasicInfoModel>("basicInfo")
							.prepareCreate((model) => {
								model.permitId = permit.id
								model.site = ""
								model.date = ""
								model.isCompleted = false
							}),
					)
				}

				if (!existingHeaderIds.has(permit.id)) {
					batchOps.push(
						database
							.get<ShearingHeaderModel>("shearingHeader")
							.prepareCreate((model) => {
								model.permitId = permit.id
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

				if (!existingCleaningHeaderIds.has(permit.id)) {
					batchOps.push(
						database
							.get<CleaningHeaderModel>("cleaningHeader")
							.prepareCreate((model) => {
								model.permitId = permit.id
								model.startDate = ""
								model.endDate = ""
								model.site = ""
								model.supervisors = ""
								model.isCompleted = false
							}),
					)
				}
			}

			if (batchOps.length > 0) {
				await database.batch(...batchOps)
			}
		})
	} finally {
		savingPermits = false
	}
}
