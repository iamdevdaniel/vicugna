import type { NativePermitData } from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import {
	applyPermitStatusChange,
	getPermitStatuses,
	type PermitStatusChange,
	type PermitStatuses,
} from "@utils/permit-status-rules"
import { mapToPermit } from "./model-mapping"
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

// ==========================================
// READ
// ==========================================

export function subscribePermits(
	accountId: string,
	callbacks: SubscriptionCallback<NativePermitData[]>,
): () => void {
	const sub = database
		.get<PermitModel>("permits")
		.query(Q.where("userId", accountId), Q.sortBy("permitNumber", Q.asc))
		.observeWithColumns([
			"permitNumber",
			"communityId",
			"syncStatus",
			"syncedAt",
			"baseHash",
			"hashVersion",
			"hasLocalChanges",
			"syncPending",
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
	accountId: string,
	callbacks: SubscriptionCallback<NativePermitData | null>,
): () => void {
	const sub = database
		.get<PermitModel>("permits")
		.query(Q.where("id", permitId), Q.where("userId", accountId))
		.observeWithColumns([
			"permitNumber",
			"communityId",
			"syncStatus",
			"syncedAt",
			"baseHash",
			"hashVersion",
			"hasLocalChanges",
			"syncPending",
			"participantsStatus",
			"shearingStatus",
			"cleaningStatus",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(records[0] ? mapToPermit(records[0]) : null),
			error: (error) => callbacks.onError(error as Error),
		})

	return () => sub.unsubscribe()
}

// ==========================================
// WRITE
// ==========================================

export async function batchWithPermitStatusUpdate(
	permitId: string,
	accountId: string,
	prepareMutation: () => PreparedPermitMutation,
): Promise<void> {
	const currentState = await readPermitStatusState(permitId, accountId)
	const { operations, statusChange } = prepareMutation()
	const statuses = getPermitStatuses(
		applyPermitStatusChange(currentState, statusChange),
	)
	const permitUpdate = preparePermitLocalSave(currentState.permit, statuses)

	await database.batch([...operations, permitUpdate])
}

// ==========================================
// HELPERS
// ==========================================

export function assertPermitOwner(
	permitUserId: string,
	accountId: string,
): void {
	if (permitUserId !== accountId) {
		throw new Error("El permiso no pertenece a la cuenta activa")
	}
}

function assertPermitHasNoPendingSync(permit: PermitModel): void {
	if (permit.syncPending) {
		throw new Error(
			"Este permiso tiene un envío pendiente. Reintente el envío antes de modificarlo.",
		)
	}
}

async function readPermitStatusState(permitId: string, accountId: string) {
	const permit = await database.get<PermitModel>("permits").find(permitId)
	assertPermitOwner(permit.userId, accountId)
	assertPermitHasNoPendingSync(permit)
	const [
		participantCount,
		shearingHeaders,
		shearingRecordCount,
		cleaningHeaders,
		cleaningRecords,
	] = await Promise.all([
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

function preparePermitLocalSave(
	permit: PermitModel,
	statuses: PermitStatuses,
): PermitModel {
	return permit.prepareUpdate((model) => {
		model.participantsStatus = statuses.participantsStatus
		model.shearingStatus = statuses.shearingStatus
		model.cleaningStatus = statuses.cleaningStatus
		model.hasLocalChanges = true
	})
}
