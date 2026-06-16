import type {
	ShearingHeaderData,
	ShearingHeaderFormData,
	ShearingRecordData,
	ShearingRecordFormData,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import {
	applyShearingHeaderToModel,
	applyShearingRecordToModel,
	mapToShearingHeader,
	mapToShearingRecord,
	mapToShearingRecordFormData,
} from "./mappers"
import type { ShearingHeaderModel, ShearingRecordModel } from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

//-------------------READ-------------------

export function subscribeSingleShearingHeader(
	permitId: string,
	callbacks: SubscriptionCallback<ShearingHeaderData | null>,
): () => void {
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
				callbacks.onChange(
					records[0] ? mapToShearingHeader(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeBulkShearingRecords(
	permitId: string,
	callbacks: SubscriptionCallback<ShearingRecordData[]>,
): () => void {
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
				callbacks.onChange(records.map(mapToShearingRecord)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleShearingRecordFormData(
	recordId: string,
	callbacks: SubscriptionCallback<ShearingRecordFormData>,
): () => void {
	const sub = database
		.get<ShearingRecordModel>("shearingRecord")
		.findAndObserve(recordId)
		.subscribe({
			next: (record) =>
				callbacks.onChange(mapToShearingRecordFormData(record)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
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

export async function createSingleShearingRecord(
	permitId: string,
	data: ShearingRecordFormData,
): Promise<ShearingRecordData> {
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

export async function updateSingleShearingRecord(
	recordId: string,
	data: ShearingRecordFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingRecordModel>("shearingRecord")
			.find(recordId)
		await record.update((model) => {
			applyShearingRecordToModel(model, data)
		})
	})
}

export async function deleteSingleShearingRecord(
	recordId: string,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<ShearingRecordModel>("shearingRecord")
			.find(recordId)
		await record.destroyPermanently()
	})
}
