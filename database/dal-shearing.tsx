import type {
	ShearingHeader,
	ShearingHeaderFormData,
	ShearingRecord,
	ShearingRecordFormData,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { useEffect, useReducer } from "react"
import {
	applyShearingHeaderToModel,
	applyShearingRecordToModel,
	mapToShearingHeader,
	mapToShearingRecord,
	mapToShearingRecordFormData,
} from "./mappers"
import type { ShearingHeaderModel, ShearingRecordModel } from "./models"
import { database } from "./setup"
import { type DbState, makeInitial, makeReducer } from "./utils-db"

//-------------------READ-------------------

export function useReadShearingHeader(
	permitId: string,
): DbState<ShearingHeader | null> {
	const [state, dispatch] = useReducer(
		makeReducer<ShearingHeader | null>(),
		makeInitial<ShearingHeader | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.observeWithColumns([
				"site",
				"latitude",
				"longitude",
				"roundupCount",
				"startTime",
				"endTime",
				"isCompleted",
			])
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records[0]
							? mapToShearingHeader(records[0])
							: null,
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [permitId])

	return state
}

export function useReadShearingRecords(
	permitId: string,
): DbState<ShearingRecord[]> {
	const [state, dispatch] = useReducer(
		makeReducer<ShearingRecord[]>(),
		makeInitial<ShearingRecord[]>([]),
	)

	useEffect(() => {
		const sub = database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.observeWithColumns([
				"tagNumber",
				"sex",
				"ageCategory",
				"liveWeight",
				"fiberLength",
				"bodyCondition",
				"gestationStatus",
				"externalParasites",
				"mangeSeverity",
				"hasDandruff",
				"isSheared",
				"isDead",
				"observations",
			])
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records.map(mapToShearingRecord),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [permitId])

	return state
}

export function useReadOneShearingRecord(
	id: string,
): DbState<ShearingRecord | null> {
	const [state, dispatch] = useReducer(
		makeReducer<ShearingRecord | null>(),
		makeInitial<ShearingRecord | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<ShearingRecordModel>("shearingRecord")
			.findAndObserve(id)
			.subscribe({
				next: (record) =>
					dispatch({
						type: "success",
						data: mapToShearingRecord(record),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [id])

	return state
}

export function useReadOneShearingRecordFormData(
	id?: string,
): DbState<ShearingRecordFormData | null> {
	const [state, dispatch] = useReducer(
		makeReducer<ShearingRecordFormData | null>(),
		makeInitial<ShearingRecordFormData | null>(null),
	)

	useEffect(() => {
		if (!id) {
			dispatch({ type: "success", data: null })
			return
		}

		const sub = database
			.get<ShearingRecordModel>("shearingRecord")
			.findAndObserve(id)
			.subscribe({
				next: (record) =>
					dispatch({
						type: "success",
						data: mapToShearingRecordFormData(record),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [id])

	return state
}

//-------------------WRITE-------------------

export async function updateShearingHeader(
	id: string,
	data: ShearingHeaderFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingHeaderModel>("shearingHeader")
			.find(id)
		await record.update((model) =>
			applyShearingHeaderToModel(model, data, true),
		)
	})
}

export async function createShearingRecord(
	permitId: string,
	data: ShearingRecordFormData,
): Promise<ShearingRecord> {
	let record: ShearingRecordModel | undefined
	await database.write(async () => {
		record = await database
			.get<ShearingRecordModel>("shearingRecord")
			.create((model) => {
				applyShearingRecordToModel(model, data, permitId)
			})
	})
	if (!record) throw new Error("Failed to create shearing record")
	return mapToShearingRecord(record)
}

export async function updateShearingRecord(
	id: string,
	data: ShearingRecordFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingRecordModel>("shearingRecord")
			.find(id)
		await record.update((model) => {
			applyShearingRecordToModel(model, data)
		})
	})
}

export async function deleteShearingRecord(id: string): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingRecordModel>("shearingRecord")
			.find(id)
		await record.destroyPermanently()
	})
}
