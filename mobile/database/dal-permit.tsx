import type { PermitData } from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import { getDependentStepStatus } from "@utils/misc"
import {
	applyPermitToModel,
	applySyncPermitToModel,
	mapToPermit,
} from "./mappers"
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
		.observeWithColumns([
			"permitNumber",
			"communityId",
			"isSynced",
			"syncedAt",
			"participantsStatus",
			"shearingStatus",
			"cleaningStatus",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records.map((record) => mapToPermit(record)),
				),
			error: (error) => callbacks.onError(error as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSinglePermit(
	permitId: string,
	callbacks: SubscriptionCallback<PermitData>,
): () => void {
	const sub = database
		.get<PermitModel>("permits")
		.findAndObserve(permitId)
		.subscribe({
			next: (record) => callbacks.onChange(mapToPermit(record)),
			error: (error) => callbacks.onError(error as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function savePermits(
	permits: Array<
		Omit<
			PermitData,
			"participantsStatus" | "shearingStatus" | "cleaningStatus"
		>
	>,
): Promise<void> {
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
								applySyncPermitToModel(model, permit)
							}),
						)
					}
					continue
				}

				batchOps.push(
					database
						.get<PermitModel>("permits")
						.prepareCreate((model) => {
							applyPermitToModel(model, {
								...permit,
								participantsStatus: "ready",
								shearingStatus: "disabled",
								cleaningStatus: "disabled",
							})
							model._raw.id = permit.id
						}),
				)

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
								model.eventDate = ""
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

export async function updatePermitSyncStatus(data: {
	permitId: string
	isSynced: boolean
	syncedAt: string | null
}): Promise<void> {
	const permit = await database
		.get<PermitModel>("permits")
		.find(data.permitId)

	await database.write(async () => {
		await permit.update((model) => {
			model.isSynced = data.isSynced
			model.syncedAt = data.syncedAt
		})
	})
}

export async function recalculatePermitStatuses(
	permitId: string,
): Promise<void> {
	const [permit, participantCount, shearingRecordCount] = await Promise.all([
		database.get<PermitModel>("permits").find(permitId),
		database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.fetchCount(),
		database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.fetchCount(),
	])
	const participantsStatus = participantCount > 0 ? "done" : "ready"
	const shearingStatus = getDependentStepStatus(
		participantsStatus === "done",
		shearingRecordCount > 0,
	)
	const cleaningStatus = await readCleaningStatus(permitId, shearingStatus)

	if (
		permit.participantsStatus === participantsStatus &&
		permit.shearingStatus === shearingStatus &&
		permit.cleaningStatus === cleaningStatus
	) {
		return
	}

	await permit.update((model) => {
		model.participantsStatus = participantsStatus
		model.shearingStatus = shearingStatus
		model.cleaningStatus = cleaningStatus
	})
}

async function readCleaningStatus(
	permitId: string,
	shearingStatus: PermitData["shearingStatus"],
): Promise<PermitData["cleaningStatus"]> {
	if (shearingStatus !== "done") return "disabled"

	const [cleaningHeaders, cleaningCommonRecords] = await Promise.all([
		database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<CleaningCommonModel>("cleaningCommon")
			.query(Q.where("permitId", permitId))
			.fetch(),
	])
	const cleaningHeader = cleaningHeaders[0]
	if (!cleaningHeader?.isCompleted || cleaningCommonRecords.length === 0) {
		return "ready"
	}

	const cleaningRecordIds = cleaningCommonRecords.map((record) => record.id)

	const [groomingRecords, dehearingRecords] = await Promise.all([
		database
			.get<GroomingModel>("grooming")
			.query(
				Q.where("cleaningCommonId", Q.oneOf(cleaningRecordIds)),
				Q.where("isCompleted", true),
			)
			.fetch(),
		database
			.get<DehearingModel>("dehearing")
			.query(
				Q.where("cleaningCommonId", Q.oneOf(cleaningRecordIds)),
				Q.where("isCompleted", true),
			)
			.fetch(),
	])

	const completedGroomingIds = new Set(
		groomingRecords.map((record) => record.cleaningCommonId),
	)
	const completedDehearingIds = new Set(
		dehearingRecords.map((record) => record.cleaningCommonId),
	)

	return getDependentStepStatus(
		true,
		cleaningRecordIds.every(
			(recordId) =>
				completedGroomingIds.has(recordId) ||
				completedDehearingIds.has(recordId),
		),
	)
}
