import type { Participant, ParticipantFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { useEffect, useReducer } from "react"
import { applyParticipantToModel, mapToParticipant } from "./mappers"
import type { ParticipantModel } from "./models"
import { database } from "./setup"
import { type DbState, makeInitial, makeReducer } from "./utils-db"

const COLUMNS = [
	"name",
	"lastNames",
	"gender",
	"identityNumber",
	"signature",
	"notes",
]

//-------------------READ-------------------

export function useReadParticipants(permitId: string): DbState<Participant[]> {
	const [state, dispatch] = useReducer(
		makeReducer<Participant[]>(),
		makeInitial<Participant[]>([]),
	)

	useEffect(() => {
		const sub = database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.observeWithColumns(COLUMNS)
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records.map(mapToParticipant),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [permitId])

	return state
}

export function useReadOneParticipant(id: string): DbState<Participant | null> {
	const [state, dispatch] = useReducer(
		makeReducer<Participant | null>(),
		makeInitial<Participant | null>(null),
	)

	useEffect(() => {
		if (id === "new") {
			dispatch({ type: "success", data: null })
			return
		}
		const sub = database
			.get<ParticipantModel>("participants")
			.findAndObserve(id)
			.subscribe({
				next: (record) =>
					dispatch({
						type: "success",
						data: mapToParticipant(record),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [id])

	return state
}

//-------------------WRITE-------------------

export async function createParticipant(
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

export async function updateParticipant(
	id: string,
	data: ParticipantFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(id)
		await record.update((model) => {
			applyParticipantToModel(model, data)
		})
	})
}

export async function deleteParticipant(id: string): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ParticipantModel>("participants")
			.find(id)
		await record.destroyPermanently()
	})
}
