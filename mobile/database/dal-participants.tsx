import type { Participant, ParticipantFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
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
	callbacks: SubscriptionCallback<Participant[]>,
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
	callbacks: SubscriptionCallback<Participant>,
): () => void {
	const sub = database
		.get<ParticipantModel>("participants")
		.findAndObserve(participantId)
		.subscribe({
			next: (record) => callbacks.onChange(mapToParticipant(record)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function createSingleParticipant(
	permitId: string,
	data: ParticipantFormData,
): Promise<Participant> {
	let record: ParticipantModel | undefined
	await database.write(async () => {
		record = await database
			.get<ParticipantModel>("participants")
			.create((model) => {
				model.permitId = permitId
				applyParticipantToModel(model, data)
			})
	})
	if (!record) throw new Error("Failed to create participant")
	return mapToParticipant(record)
}

export async function updateSingleParticipant(
	participantId: string,
	data: ParticipantFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(participantId)
		await record.update((model) => {
			applyParticipantToModel(model, data)
		})
	})
}

export async function deleteSingleParticipant(
	participantId: string,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(participantId)
		await record.destroyPermanently()
	})
}
