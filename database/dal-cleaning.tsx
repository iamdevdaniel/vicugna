import type {
	CleaningCommon,
	CleaningCommonFormData,
	CleaningHeader,
	CleaningHeaderFormData,
	Dehearing,
	DehearingFormData,
	Grooming,
	GroomingFormData,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
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
	callbacks: SubscriptionCallback<CleaningHeader | null>,
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
	callbacks: SubscriptionCallback<CleaningCommon[]>,
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
	callbacks: SubscriptionCallback<CleaningCommon>,
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
	callbacks: SubscriptionCallback<Grooming | null>,
): () => void {
	const sub = database
		.get<GroomingModel>("grooming")
		.query(Q.where("cleaningCommonId", cleaningCommonId))
		.observeWithColumns(["cleanWeight", "dirtyWeight", "totalWeight"])
		.subscribe({
			next: (records) =>
				callbacks.onChange(
					records[0] ? mapToGrooming(records[0]) : null,
				),
			error: (e) => callbacks.onError(e as Error),
		})

	return () => sub.unsubscribe()
}

export function subscribeSingleDehearing(
	cleaningCommonId: string,
	callbacks: SubscriptionCallback<Dehearing | null>,
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

//-------------------WRITE-------------------

export async function updateSingleCleaningHeader(
	headerId: string,
	data: CleaningHeaderFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<CleaningHeaderModel>("cleaningHeader")
			.find(headerId)
		await record.update((model) =>
			applyCleaningHeaderToModel(model, data, true),
		)
	})
}

export async function createSingleCleaningCommon(
	permitId: string,
	data: CleaningCommonFormData,
): Promise<CleaningCommon> {
	let record: CleaningCommonModel | undefined
	await database.write(async () => {
		record = await database
			.get<CleaningCommonModel>("cleaningCommon")
			.create((model) => {
				applyCleaningCommonToModel(model, data, permitId)
			})
	})
	if (!record) throw new Error("Failed to create cleaning common")
	return mapToCleaningCommon(record)
}

export async function updateSingleCleaningCommon(
	cleaningCommonId: string,
	data: CleaningCommonFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<CleaningCommonModel>("cleaningCommon")
			.find(cleaningCommonId)
		await record.update((model) => {
			applyCleaningCommonToModel(model, data)
		})
	})
}

export async function deleteSingleCleaningCommon(
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

		for (const grooming of groomingRecords) {
			await grooming.destroyPermanently()
		}
		for (const dehearing of dehearingRecords) {
			await dehearing.destroyPermanently()
		}
		await record.destroyPermanently()
	})
}

export async function createSingleGrooming(
	cleaningCommonId: string,
	data: GroomingFormData,
): Promise<Grooming> {
	let record: GroomingModel | undefined
	await database.write(async () => {
		record = await database
			.get<GroomingModel>("grooming")
			.create((model) => {
				applyGroomingToModel(model, data, cleaningCommonId)
			})
	})
	if (!record) throw new Error("Failed to create grooming")
	return mapToGrooming(record)
}

export async function updateSingleGrooming(
	groomingId: string,
	data: GroomingFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<GroomingModel>("grooming")
			.find(groomingId)
		await record.update((model) => {
			applyGroomingToModel(model, data)
		})
	})
}

export async function deleteSingleGrooming(groomingId: string): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<GroomingModel>("grooming")
			.find(groomingId)
		await record.destroyPermanently()
	})
}

export async function createSingleDehearing(
	cleaningCommonId: string,
	data: DehearingFormData,
): Promise<Dehearing> {
	let record: DehearingModel | undefined
	await database.write(async () => {
		record = await database
			.get<DehearingModel>("dehearing")
			.create((model) => {
				applyDehearingToModel(model, data, cleaningCommonId)
			})
	})
	if (!record) throw new Error("Failed to create dehearing")
	return mapToDehearing(record)
}

export async function updateSingleDehearing(
	dehearingId: string,
	data: DehearingFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<DehearingModel>("dehearing")
			.find(dehearingId)
		await record.update((model) => {
			applyDehearingToModel(model, data)
		})
	})
}

export async function deleteSingleDehearing(
	dehearingId: string,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<DehearingModel>("dehearing")
			.find(dehearingId)
		await record.destroyPermanently()
	})
}
