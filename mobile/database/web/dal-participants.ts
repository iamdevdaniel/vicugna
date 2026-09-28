import type { ParticipantData, ParticipantFormData } from "@definitions/types"
import { liveQuery } from "dexie"
import { getPermitStatusesAfterParticipantCount } from "../../utils/permit-status-rules"
import { getWebFieldDatabase, type WebFieldDatabase } from "./setup"

type SubscriptionCallbacks<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

export function subscribeBulkParticipants(
	accountId: string,
	permitId: string,
	callbacks: SubscriptionCallbacks<ParticipantData[]>,
): () => void {
	const database = getWebFieldDatabase(accountId)
	const subscription = liveQuery(async () => {
		const records = await database.participants
			.where("permitId")
			.equals(permitId)
			.sortBy("createdAt")

		return records.map(({ createdAt: _, ...participant }) => participant)
	}).subscribe({
		next: callbacks.onChange,
		error: (error) => callbacks.onError(error as Error),
	})

	return () => subscription.unsubscribe()
}

export async function createSingleParticipant(
	accountId: string,
	permitId: string,
	data: ParticipantFormData,
): Promise<ParticipantData> {
	const database = getWebFieldDatabase(accountId)
	const participant: ParticipantData = {
		id: crypto.randomUUID(),
		permitId,
		...data,
	}

	await database.transaction(
		"rw",
		database.permits,
		database.participants,
		async () => {
			await assertPermitEditable(database, permitId)
			await database.participants.add({
				...participant,
				createdAt: Date.now(),
			})
			await updateParticipantStatus(database, permitId)
		},
	)

	return participant
}

export async function updateSingleParticipant(
	accountId: string,
	participantId: string,
	data: ParticipantFormData,
): Promise<void> {
	const database = getWebFieldDatabase(accountId)

	await database.transaction(
		"rw",
		database.permits,
		database.participants,
		async () => {
			const participant = await database.participants.get(participantId)
			if (!participant) throw new Error("El participante no existe")

			await assertPermitEditable(database, participant.permitId)
			await database.participants.update(participantId, data)
		},
	)
}

export async function deleteSingleParticipant(
	accountId: string,
	participantId: string,
): Promise<void> {
	const database = getWebFieldDatabase(accountId)

	await database.transaction(
		"rw",
		database.permits,
		database.participants,
		async () => {
			const participant = await database.participants.get(participantId)
			if (!participant) throw new Error("El participante no existe")

			await assertPermitEditable(database, participant.permitId)
			await database.participants.delete(participantId)
			await updateParticipantStatus(database, participant.permitId)
		},
	)
}

async function assertPermitEditable(
	database: WebFieldDatabase,
	permitId: string,
): Promise<void> {
	const permit = await database.permits.get(permitId)
	if (!permit) throw new Error("El permiso no existe")
	if (permit.syncStatus === "synced") {
		throw new Error("El permiso sincronizado es de solo lectura")
	}
}

async function updateParticipantStatus(
	database: WebFieldDatabase,
	permitId: string,
): Promise<void> {
	const [permit, participantCount] = await Promise.all([
		database.permits.get(permitId),
		database.participants.where("permitId").equals(permitId).count(),
	])
	if (!permit) throw new Error("El permiso no existe")

	const statuses = getPermitStatusesAfterParticipantCount(
		permit,
		participantCount,
	)

	await database.permits.update(permitId, statuses)
}
