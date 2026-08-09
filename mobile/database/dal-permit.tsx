import type { PermitData, PermitSyncResult } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { getDependentStepStatus } from "@utils/misc"
import { mapToPermit } from "./mappers"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
	ParticipantModel,
	PermitModel,
	ShearingRecordModel,
} from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

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
			"syncStatus",
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

export async function updatePermitSyncStatus(
	data:
		| PermitSyncResult
		| {
				permitId: string
				syncStatus: PermitData["syncStatus"]
				syncedAt: string | null
				syncVersion: number | null
		  },
): Promise<void> {
	const permit = await database
		.get<PermitModel>("permits")
		.find(data.permitId)

	await database.write(async () => {
		await permit.update((model) => {
			model.permitSyncStatus = data.syncStatus
			model.syncedAt = data.syncedAt
			model.syncVersion = data.syncVersion
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
