import type { PermitData, PermitSyncResult } from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import {
	applyPermitStatusChange,
	getPermitStatuses,
	type PermitStatusChange,
	type PermitStatuses,
} from "@utils/permit-status-rules"
import { mapToPermit } from "./mappers"
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

type PreparedPermitMutation = {
	operations: Model[]
	statusChange: PermitStatusChange
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

export async function batchWithPermitStatusUpdate(
	permitId: string,
	prepareMutation: () => PreparedPermitMutation,
): Promise<void> {
	const currentState = await readPermitStatusState(permitId)
	const { operations, statusChange } = prepareMutation()
	const statuses = getPermitStatuses(
		applyPermitStatusChange(currentState, statusChange),
	)
	const statusUpdate = preparePermitStatusUpdate(
		currentState.permit,
		statuses,
	)

	await database.batch([
		...operations,
		...(statusUpdate ? [statusUpdate] : []),
	])
}

async function readPermitStatusState(permitId: string) {
	const [
		permit,
		participantCount,
		shearingHeaders,
		shearingRecordCount,
		cleaningHeaders,
		cleaningRecords,
	] = await Promise.all([
		database.get<PermitModel>("permits").find(permitId),
		database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.fetchCount(),
		database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.fetchCount(),
		database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<CleaningCommonModel>("cleaningCommon")
			.query(Q.where("permitId", permitId))
			.fetch(),
	])
	const cleaningRecordIds = new Set(
		cleaningRecords.map((record) => record.id),
	)
	const completedCleaningRecordIds = new Set<string>()

	if (cleaningRecordIds.size > 0) {
		const ids = [...cleaningRecordIds]
		const [groomingRecords, dehearingRecords] = await Promise.all([
			database
				.get<GroomingModel>("grooming")
				.query(
					Q.where("cleaningCommonId", Q.oneOf(ids)),
					Q.where("isCompleted", true),
				)
				.fetch(),
			database
				.get<DehearingModel>("dehearing")
				.query(
					Q.where("cleaningCommonId", Q.oneOf(ids)),
					Q.where("isCompleted", true),
				)
				.fetch(),
		])

		for (const record of groomingRecords)
			completedCleaningRecordIds.add(record.cleaningCommonId)
		for (const record of dehearingRecords)
			completedCleaningRecordIds.add(record.cleaningCommonId)
	}

	return {
		permit,
		participantCount,
		shearingHeaderCompleted: Boolean(shearingHeaders[0]?.isCompleted),
		shearingRecordCount,
		cleaningHeaderCompleted: Boolean(cleaningHeaders[0]?.isCompleted),
		cleaningRecordIds,
		completedCleaningRecordIds,
	}
}

function preparePermitStatusUpdate(
	permit: PermitModel,
	statuses: PermitStatuses,
): PermitModel | null {
	if (
		permit.participantsStatus === statuses.participantsStatus &&
		permit.shearingStatus === statuses.shearingStatus &&
		permit.cleaningStatus === statuses.cleaningStatus
	) {
		return null
	}

	return permit.prepareUpdate((model) => {
		model.participantsStatus = statuses.participantsStatus
		model.shearingStatus = statuses.shearingStatus
		model.cleaningStatus = statuses.cleaningStatus
	})
}
