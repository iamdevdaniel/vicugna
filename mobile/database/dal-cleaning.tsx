import type {
	CleaningCommonData,
	CleaningCommonFormData,
	CleaningHeaderData,
	CleaningHeaderFormData,
	CleaningRecordSaveData,
	DehearingData,
	GroomingData,
} from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import { recalculatePermitStatuses } from "./dal-permit"
import {
	applyCleaningCommonToModel,
	applyCleaningHeaderToModel,
	applyDehearingToModel,
	applyGroomingToModel,
	mapToCleaningCommon,
	mapToCleaningHeader,
	mapToDehearing,
	mapToGrooming,
} from "./mappers"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
} from "./models"
import { database } from "./setup"

type SubscriptionCallback<T> = {
	onChange: (data: T) => void
	onError: (error: Error) => void
}

//-------------------READ-------------------

export function subscribeSingleCleaningHeader(
	permitId: string,
	callbacks: SubscriptionCallback<CleaningHeaderData | null>,
): () => void {
	const sub = database
		.get<CleaningHeaderModel>("cleaningHeader")
		.query(Q.where("permitId", permitId))
		.observeWithColumns([
			"startDate",
			"endDate",
			"site",
			"supervisors",
			"isCompleted",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToCleaningHeader(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeBulkCleaningCommon(
	permitId: string,
	callbacks: SubscriptionCallback<CleaningCommonData[]>,
): () => void {
	const sub = database
		.get<CleaningCommonModel>("cleaningCommon")
		.query(Q.where("permitId", permitId))
		.observeWithColumns(["fleeceNumber", "grossWeight"])
		.subscribe({
			next: (records) =>
				callbacks.onChange(records.map(mapToCleaningCommon)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleCleaningCommon(
	cleaningCommonId: string,
	callbacks: SubscriptionCallback<CleaningCommonData>,
): () => void {
	const sub = database
		.get<CleaningCommonModel>("cleaningCommon")
		.findAndObserve(cleaningCommonId)
		.subscribe({
			next: (record) => callbacks.onChange(mapToCleaningCommon(record)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleGrooming(
	cleaningCommonId: string,
	callbacks: SubscriptionCallback<GroomingData | null>,
): () => void {
	const sub = database
		.get<GroomingModel>("grooming")
		.query(Q.where("cleaningCommonId", cleaningCommonId))
		.observeWithColumns([
			"cleanWeight",
			"dirtyWeight",
			"totalWeight",
			"isCompleted",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToGrooming(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeBulkGrooming(
	cleaningCommonIds: string[],
	callbacks: SubscriptionCallback<GroomingData[]>,
): () => void {
	if (cleaningCommonIds.length === 0) {
		callbacks.onChange([])
		return () => {}
	}

	const sub = database
		.get<GroomingModel>("grooming")
		.query(Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)))
		.observeWithColumns([
			"cleanWeight",
			"dirtyWeight",
			"totalWeight",
			"isCompleted",
		])
		.subscribe({
			next: (records) => callbacks.onChange(records.map(mapToGrooming)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleDehearing(
	cleaningCommonId: string,
	callbacks: SubscriptionCallback<DehearingData | null>,
): () => void {
	const sub = database
		.get<DehearingModel>("dehearing")
		.query(Q.where("cleaningCommonId", cleaningCommonId))
		.observeWithColumns([
			"dehairedWeight",
			"bristleWeight",
			"hasDandruff",
			"dehairerName",
			"signature",
			"isCompleted",
		])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToDehearing(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeBulkDehearing(
	cleaningCommonIds: string[],
	callbacks: SubscriptionCallback<DehearingData[]>,
): () => void {
	if (cleaningCommonIds.length === 0) {
		callbacks.onChange([])
		return () => {}
	}

	const sub = database
		.get<DehearingModel>("dehearing")
		.query(Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)))
		.observeWithColumns([
			"dehairedWeight",
			"bristleWeight",
			"hasDandruff",
			"dehairerName",
			"signature",
			"isCompleted",
		])
		.subscribe({
			next: (records) => callbacks.onChange(records.map(mapToDehearing)),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

//-------------------WRITE-------------------

export async function updateSingleCleaningHeader(
	headerId: string,
	data: CleaningHeaderFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.find(headerId)
		await record.update((model) => applyCleaningHeaderToModel(model, data))
		await recalculatePermitStatuses(record.permitId)
	})
}

export async function createSingleCleaningRecord(
	permitId: string,
	data: CleaningCommonFormData,
): Promise<void> {
	await database.write(async () => {
		const commonRecord = database
			.get<CleaningCommonModel>("cleaningCommon")
			.prepareCreate((model) => {
				applyCleaningCommonToModel(model, data, permitId)
			})

		await database.batch(commonRecord)
		await recalculatePermitStatuses(permitId)
	})
}

export async function updateSingleCleaningRecord(
	cleaningCommonId: string,
	data: CleaningRecordSaveData,
): Promise<void> {
	await database.write(async () => {
		const commonRecord = await database
			.get<CleaningCommonModel>("cleaningCommon")
			.find(cleaningCommonId)
		const [groomingRecords, dehearingRecords] = await Promise.all([
			database
				.get<GroomingModel>("grooming")
				.query(Q.where("cleaningCommonId", cleaningCommonId))
				.fetch(),
			database
				.get<DehearingModel>("dehearing")
				.query(Q.where("cleaningCommonId", cleaningCommonId))
				.fetch(),
		])
		const batchOps: Model[] = [
			commonRecord.prepareUpdate((model) => {
				applyCleaningCommonToModel(model, data.common)
			}),
		]

		if (data.cleaningType === "grooming") {
			batchOps.push(
				...dehearingRecords.map((record) =>
					record.prepareDestroyPermanently(),
				),
				...groomingRecords
					.slice(1)
					.map((record) => record.prepareDestroyPermanently()),
				groomingRecords[0]
					? groomingRecords[0].prepareUpdate((model) => {
							applyGroomingToModel(model, data.detail)
						})
					: database
							.get<GroomingModel>("grooming")
							.prepareCreate((model) => {
								applyGroomingToModel(
									model,
									data.detail,
									cleaningCommonId,
								)
							}),
			)
		} else {
			batchOps.push(
				...groomingRecords.map((record) =>
					record.prepareDestroyPermanently(),
				),
				...dehearingRecords
					.slice(1)
					.map((record) => record.prepareDestroyPermanently()),
				dehearingRecords[0]
					? dehearingRecords[0].prepareUpdate((model) => {
							applyDehearingToModel(model, data.detail)
						})
					: database
							.get<DehearingModel>("dehearing")
							.prepareCreate((model) => {
								applyDehearingToModel(
									model,
									data.detail,
									cleaningCommonId,
								)
							}),
			)
		}

		await database.batch(batchOps)
		await recalculatePermitStatuses(commonRecord.permitId)
	})
}

export async function deleteSingleCleaningRecord(
	cleaningCommonId: string,
): Promise<void> {
	await database.write(async () => {
		const groomingRecords = await database
			.get<GroomingModel>("grooming")
			.query(Q.where("cleaningCommonId", cleaningCommonId))
			.fetch()
		const dehearingRecords = await database
			.get<DehearingModel>("dehearing")
			.query(Q.where("cleaningCommonId", cleaningCommonId))
			.fetch()
		const record = await database
			.get<CleaningCommonModel>("cleaningCommon")
			.find(cleaningCommonId)
		const { permitId } = record
		const batchOps: Model[] = [
			...groomingRecords.map((item) => item.prepareDestroyPermanently()),
			...dehearingRecords.map((item) => item.prepareDestroyPermanently()),
			record.prepareDestroyPermanently(),
		]
		await database.batch(batchOps)
		await recalculatePermitStatuses(permitId)
	})
}
