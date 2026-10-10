import type { ParticipantData, ParticipantFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import {
	assertStoredPermitOwner,
	batchWithPermitStatusUpdate,
} from "./dal-permit"
import { applyParticipantToModel, mapToParticipant } from "./mappers"
import type { ParticipantModel } from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

const COLUMNS = [
	"name",
	"lastNames",
	"gender",
	"identityNumber",
	"signature",
	"notes",
]

//-------------------READ-------------------

export function subscribeBulkParticipants(
	permitId: string,
	callbacks: SubscriptionCallback<ParticipantData[]>,
): () => void {
	const sub = database
		.get<ParticipantModel>("participants")
		.query(Q.where("permitId", permitId))
		.observeWithColumns(COLUMNS)
		.subscribe({
			next: (records) =>
				callbacks.onChange(records.map(mapToParticipant)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleParticipant(
	participantId: string,
	permitId: string,
	callbacks: SubscriptionCallback<ParticipantData | null>,
): () => void {
	const sub = database
		.get<ParticipantModel>("participants")
		.query(Q.where("id", participantId), Q.where("permitId", permitId))
		.observeWithColumns(COLUMNS)
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToParticipant(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function createSingleParticipant(
	permitId: string,
	data: ParticipantFormData,
	accountId: string,
): Promise<ParticipantData> {
	let record: ParticipantModel | undefined
	await database.write(async () => {
		await batchWithPermitStatusUpdate(permitId, accountId, () => {
			record = database
				.get<ParticipantModel>("participants")
				.prepareCreate((model) => {
					model.permitId = permitId
					applyParticipantToModel(model, data)
				})

			return {
				operations: [record],
				statusChange: { participantCountDelta: 1 },
			}
		})
	})
	if (!record) throw new Error("Failed to create participant")
	return mapToParticipant(record)
}

export async function updateSingleParticipant(
	participantId: string,
	data: ParticipantFormData,
	accountId: string,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(participantId)
		await assertStoredPermitOwner(record.permitId, accountId)
		await record.update((model) => {
			applyParticipantToModel(model, data)
		})
	})
}

export async function deleteSingleParticipant(
	participantId: string,
	accountId: string,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(participantId)
		const { permitId } = record
		await batchWithPermitStatusUpdate(permitId, accountId, () => ({
			operations: [record.prepareDestroyPermanently()],
			statusChange: { participantCountDelta: -1 },
		}))
	})
}
