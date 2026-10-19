import {
	MobileOperationError,
	mobilePermitSyncErrors,
} from "@definitions/errors"
import type {
	MobilePermitData,
	PermitFieldData,
	PermitSyncResult,
	SyncFieldData,
} from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import { getPermitStatuses } from "@utils/permit-status-rules"
import {
	PermitDataValidationError,
	parseCompletePermitData,
} from "@vicugna/shared/permit-data-validation"
import { assertPermitOwner } from "./dal-permit"
import {
	applyCleaningCommonSnapshotToModel,
	applyCleaningHeaderSnapshotToModel,
	applyDehearingSnapshotToModel,
	applyGroomingSnapshotToModel,
	applyParticipantSnapshotToModel,
	applyPermitStatusesToModel,
	applyPermitToModel,
	applyShearingHeaderSnapshotToModel,
	applyShearingRecordSnapshotToModel,
	applySyncPermitToModel,
	mapToCleaningCommon,
	mapToCleaningHeader,
	mapToDehearing,
	mapToGrooming,
	mapToParticipant,
	mapToShearingHeader,
	mapToShearingRecord,
} from "./model-mapping"
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

// ==========================================
// READ
// ==========================================

export async function getPendingPermitSyncData(
	permitId: string,
	accountId: string,
): Promise<SyncFieldData> {
	try {
		const permitRecord = await database
			.get<PermitModel>("permits")
			.find(permitId)
		assertPermitOwner(permitRecord.userId, accountId)
		if (!permitRecord.syncPending) {
			throw new Error("Este permiso no tiene un envío pendiente")
		}

		return await buildFieldSyncData(permitRecord)
	} catch (error) {
		throw new MobileOperationError({
			code: mobilePermitSyncErrors.readData.code,
			message:
				error instanceof PermitDataValidationError
					? error.message
					: mobilePermitSyncErrors.readData.message,
		})
	}
}

// ==========================================
// WRITE
// ==========================================

export async function preparePermitSync(
	permitId: string,
	accountId: string,
): Promise<SyncFieldData> {
	try {
		return await database.write(async () => {
			const permitRecord = await database
				.get<PermitModel>("permits")
				.find(permitId)
			assertPermitOwner(permitRecord.userId, accountId)
			if (permitRecord.syncPending) {
				throw new Error("Este permiso ya tiene un envío pendiente")
			}

			const payload = await buildFieldSyncData(permitRecord)

			await permitRecord.update((permit) => {
				permit.syncPending = true
			})

			return payload
		})
	} catch (error) {
		throw new MobileOperationError({
			code: mobilePermitSyncErrors.prepareSync.code,
			message:
				error instanceof PermitDataValidationError
					? error.message
					: mobilePermitSyncErrors.prepareSync.message,
		})
	}
}

export async function clearPermitSyncPending(
	permitId: string,
	accountId: string,
): Promise<void> {
	try {
		await updateOwnedPermit(permitId, accountId, (permit) => {
			permit.syncPending = false
		})
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.clearPending)
	}
}

export async function confirmPermitSync(
	result: PermitSyncResult,
	accountId: string,
): Promise<void> {
	try {
		await updateOwnedPermit(result.permitId, accountId, (permit) => {
			permit.syncedAt = result.syncedAt
			permit.baseHash = result.serverHash
			permit.hashVersion = result.hashVersion
			permit.permitSyncStatus = result.syncStatus
			permit.hasLocalChanges = false
			permit.syncPending = false
		})
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.confirmUpload)
	}
}

export async function replacePermitWithServerCopy(
	accountId: string,
	download: MobilePermitData,
): Promise<void> {
	try {
		assertPermitOwner(download.permit.userId, accountId)

		await database.write(async () => {
			const permitRecord = await database
				.get<PermitModel>("permits")
				.find(download.permit.id)
			assertPermitOwner(permitRecord.userId, accountId)

			if (permitRecord.hashVersion !== download.hashVersion) {
				throw new Error(
					"La versión de datos del permiso no es compatible",
				)
			}

			const storedData = await readStoredPermitFieldData(permitRecord.id)
			const statuses = download.fieldData
				? getSnapshotStatuses(download.fieldData)
				: defaultStatuses
			const batchOps: Model[] = []

			batchOps.push(
				permitRecord.prepareUpdate((model) => {
					applySyncPermitToModel(model, download.permit)
					applyPermitStatusesToModel(model, statuses)
					model.baseHash = download.serverHash
					model.hashVersion = download.hashVersion
					model.hasLocalChanges = false
					model.syncPending = false
				}),
			)
			prepareStoredFieldDataDeletion(batchOps, storedData)

			if (download.fieldData) {
				batchOps.push(
					...storedData.shearingHeaders
						.slice(1)
						.map((header) => header.prepareDestroyPermanently()),
					...storedData.cleaningHeaders
						.slice(1)
						.map((header) => header.prepareDestroyPermanently()),
				)
				prepareSnapshotReplacement(
					batchOps,
					download.fieldData,
					storedData.shearingHeaders[0],
					storedData.cleaningHeaders[0],
				)
			} else {
				batchOps.push(
					...storedData.shearingHeaders.map((header) =>
						header.prepareDestroyPermanently(),
					),
					...storedData.cleaningHeaders.map((header) =>
						header.prepareDestroyPermanently(),
					),
					prepareEmptyShearingHeader(permitRecord.id),
					prepareEmptyCleaningHeader(permitRecord.id),
				)
			}

			await database.batch(batchOps)
		})
	} catch {
		throw new MobileOperationError(
			mobilePermitSyncErrors.replaceWithServerCopy,
		)
	}
}

export async function savePermits(
	accountId: string,
	downloads: MobilePermitData[],
): Promise<void> {
	if (downloads.length === 0) return
	for (const { permit } of downloads) {
		assertPermitOwner(permit.userId, accountId)
	}

	await database.write(async () => {
		const permitIds = downloads.map(({ permit }) => permit.id)
		const existingPermits = await database
			.get<PermitModel>("permits")
			.query(Q.where("id", Q.oneOf(permitIds)))
			.fetch()
		const permitsById = new Map(
			existingPermits.map((permit) => [permit.id, permit]),
		)
		const downloadsToSave = downloads.filter(
			({ permit, serverHash, hashVersion }) => {
				const existingPermit = permitsById.get(permit.id)
				if (!existingPermit) return true
				if (existingPermit.syncPending) return false
				if (existingPermit.hashVersion !== hashVersion) return false

				return existingPermit.baseHash === serverHash
			},
		)
		if (downloadsToSave.length === 0) return

		const permitIdsToSave = downloadsToSave.map(({ permit }) => permit.id)
		const [shearingHeaders, cleaningHeaders] = await Promise.all([
			database
				.get<ShearingHeaderModel>("shearingHeader")
				.query(Q.where("permitId", Q.oneOf(permitIdsToSave)))
				.fetch(),
			database
				.get<CleaningHeaderModel>("cleaningHeader")
				.query(Q.where("permitId", Q.oneOf(permitIdsToSave)))
				.fetch(),
		])
		const shearingHeadersByPermitId = new Map(
			shearingHeaders.map((header) => [header.permitId, header]),
		)
		const cleaningHeadersByPermitId = new Map(
			cleaningHeaders.map((header) => [header.permitId, header]),
		)
		const batchOps: Model[] = []

		for (const download of downloadsToSave) {
			const { permit, serverHash, hashVersion, fieldData } = download
			const existingPermit = permitsById.get(permit.id)
			const statuses = fieldData ? getSnapshotStatuses(fieldData) : null

			if (existingPermit) {
				batchOps.push(
					existingPermit.prepareUpdate((model) => {
						applySyncPermitToModel(model, permit)
						model.hashVersion = hashVersion
					}),
				)
			} else {
				batchOps.push(
					database
						.get<PermitModel>("permits")
						.prepareCreate((model) => {
							model._raw.id = permit.id
							applyPermitToModel(model, {
								...permit,
								...(statuses ?? defaultStatuses),
							})
							model.baseHash = serverHash
							model.hashVersion = hashVersion
							model.hasLocalChanges = false
							model.syncPending = false
						}),
				)
			}

			if (!existingPermit && fieldData) {
				prepareSnapshotReplacement(
					batchOps,
					fieldData,
					shearingHeadersByPermitId.get(permit.id),
					cleaningHeadersByPermitId.get(permit.id),
				)
				continue
			}

			if (!existingPermit && !fieldData) {
				batchOps.push(
					prepareEmptyShearingHeader(permit.id),
					prepareEmptyCleaningHeader(permit.id),
				)
			}
		}

		if (batchOps.length > 0) await database.batch(batchOps)
	})
}

// ==========================================
// HELPERS
// ==========================================

async function buildFieldSyncData(
	permitRecord: PermitModel,
): Promise<SyncFieldData> {
	const permitId = permitRecord.id
	const participants = await database
		.get<ParticipantModel>("participants")
		.query(Q.where("permitId", permitId))
		.fetch()
	const shearingHeaders = await database
		.get<ShearingHeaderModel>("shearingHeader")
		.query(Q.where("permitId", permitId))
		.fetch()
	const shearingRecords = await database
		.get<ShearingRecordModel>("shearingRecord")
		.query(Q.where("permitId", permitId))
		.fetch()
	const cleaningHeaders = await database
		.get<CleaningHeaderModel>("cleaningHeader")
		.query(Q.where("permitId", permitId))
		.fetch()
	const cleaningCommonRecords = await database
		.get<CleaningCommonModel>("cleaningCommon")
		.query(Q.where("permitId", permitId))
		.fetch()

	const cleaningCommonIds = cleaningCommonRecords.map((record) => record.id)
	const groomingDetails =
		cleaningCommonIds.length > 0
			? await database
					.get<GroomingModel>("grooming")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch()
			: []
	const dehearingDetails =
		cleaningCommonIds.length > 0
			? await database
					.get<DehearingModel>("dehearing")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch()
			: []

	const shearingHeader = shearingHeaders[0]
	const cleaningHeader = cleaningHeaders[0]

	if (!shearingHeader) {
		throw new Error("Falta la cabecera de esquila")
	}

	if (!cleaningHeader) {
		throw new Error("Falta la información general del registro de fibra")
	}

	const fieldData = {
		participants: participants.map(mapToParticipant),
		shearingHeader: mapToShearingHeader(shearingHeader),
		shearingRecords: shearingRecords.map(mapToShearingRecord),
		cleaningHeader: mapToCleaningHeader(cleaningHeader),
		cleaningCommonRecords: cleaningCommonRecords.map(mapToCleaningCommon),
		groomingDetails: groomingDetails.map(mapToGrooming),
		dehearingDetails: dehearingDetails.map(mapToDehearing),
	}

	const validatedFieldData: PermitFieldData = parseCompletePermitData(
		fieldData,
		permitId,
	)

	return {
		permitId,
		baseHash: permitRecord.baseHash,
		hashVersion: permitRecord.hashVersion,
		...validatedFieldData,
	}
}

async function updateOwnedPermit(
	permitId: string,
	accountId: string,
	change: (permit: PermitModel) => void,
): Promise<void> {
	await database.write(async () => {
		const permit = await database.get<PermitModel>("permits").find(permitId)
		assertPermitOwner(permit.userId, accountId)
		await permit.update(change)
	})
}

async function readStoredPermitFieldData(permitId: string) {
	const [
		participants,
		shearingHeaders,
		shearingRecords,
		cleaningHeaders,
		cleaningCommonRecords,
	] = await Promise.all([
		database
			.get<ParticipantModel>("participants")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<ShearingHeaderModel>("shearingHeader")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<ShearingRecordModel>("shearingRecord")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<CleaningHeaderModel>("cleaningHeader")
			.query(Q.where("permitId", permitId))
			.fetch(),
		database
			.get<CleaningCommonModel>("cleaningCommon")
			.query(Q.where("permitId", permitId))
			.fetch(),
	])
	const cleaningCommonIds = cleaningCommonRecords.map((record) => record.id)
	const [groomingDetails, dehearingDetails] = cleaningCommonIds.length
		? await Promise.all([
				database
					.get<GroomingModel>("grooming")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch(),
				database
					.get<DehearingModel>("dehearing")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch(),
			])
		: [[], []]

	return {
		participants,
		shearingHeaders,
		shearingRecords,
		cleaningHeaders,
		cleaningCommonRecords,
		groomingDetails,
		dehearingDetails,
	}
}

type StoredPermitFieldData = Awaited<
	ReturnType<typeof readStoredPermitFieldData>
>

function prepareStoredFieldDataDeletion(
	batchOps: Model[],
	storedData: StoredPermitFieldData,
) {
	batchOps.push(
		...storedData.participants.map((record) =>
			record.prepareDestroyPermanently(),
		),
		...storedData.shearingRecords.map((record) =>
			record.prepareDestroyPermanently(),
		),
		...storedData.groomingDetails.map((record) =>
			record.prepareDestroyPermanently(),
		),
		...storedData.dehearingDetails.map((record) =>
			record.prepareDestroyPermanently(),
		),
		...storedData.cleaningCommonRecords.map((record) =>
			record.prepareDestroyPermanently(),
		),
	)
}
function prepareSnapshotReplacement(
	batchOps: Model[],
	data: PermitFieldData,
	shearingHeader?: ShearingHeaderModel,
	cleaningHeader?: CleaningHeaderModel,
) {
	if (shearingHeader && shearingHeader.id === data.shearingHeader.id) {
		const currentHeader = shearingHeader
		batchOps.push(
			currentHeader.prepareUpdate((model) =>
				applyShearingHeaderSnapshotToModel(model, data.shearingHeader),
			),
		)
	} else {
		if (shearingHeader)
			batchOps.push(shearingHeader.prepareDestroyPermanently())
		batchOps.push(prepareShearingHeaderSnapshot(data.shearingHeader))
	}

	if (cleaningHeader && cleaningHeader.id === data.cleaningHeader.id) {
		const currentHeader = cleaningHeader
		batchOps.push(
			currentHeader.prepareUpdate((model) =>
				applyCleaningHeaderSnapshotToModel(model, data.cleaningHeader),
			),
		)
	} else {
		if (cleaningHeader)
			batchOps.push(cleaningHeader.prepareDestroyPermanently())
		batchOps.push(prepareCleaningHeaderSnapshot(data.cleaningHeader))
	}

	batchOps.push(
		...data.participants.map(prepareParticipantSnapshot),
		...data.shearingRecords.map(prepareShearingRecordSnapshot),
		...data.cleaningCommonRecords.map(prepareCleaningCommonSnapshot),
		...data.groomingDetails.map(prepareGroomingSnapshot),
		...data.dehearingDetails.map(prepareDehearingSnapshot),
	)
}

const defaultStatuses = {
	participantsStatus: "ready",
	shearingStatus: "disabled",
	cleaningStatus: "disabled",
} as const

function getSnapshotStatuses(data: PermitFieldData) {
	const completedCleaningIds = new Set([
		...data.groomingDetails
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
		...data.dehearingDetails
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
	])

	return getPermitStatuses({
		participantCount: data.participants.length,
		shearingHeaderCompleted: data.shearingHeader.isCompleted,
		shearingRecordCount: data.shearingRecords.length,
		cleaningHeaderCompleted: data.cleaningHeader.isCompleted,
		cleaningRecordIds: new Set(
			data.cleaningCommonRecords.map((record) => record.id),
		),
		completedCleaningRecordIds: completedCleaningIds,
	})
}

function prepareEmptyShearingHeader(permitId: string) {
	return database
		.get<ShearingHeaderModel>("shearingHeader")
		.prepareCreate((model) => {
			model.permitId = permitId
			model.site = ""
			model.latitude = 0
			model.longitude = 0
			model.roundupCount = 0
			model.eventDate = ""
			model.startTime = ""
			model.endTime = ""
			model.isCompleted = false
		})
}

function prepareEmptyCleaningHeader(permitId: string) {
	return database
		.get<CleaningHeaderModel>("cleaningHeader")
		.prepareCreate((model) => {
			model.permitId = permitId
			model.startDate = ""
			model.endDate = ""
			model.site = ""
			model.supervisors = ""
			model.isCompleted = false
		})
}

function prepareShearingHeaderSnapshot(
	data: PermitFieldData["shearingHeader"],
) {
	return database
		.get<ShearingHeaderModel>("shearingHeader")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyShearingHeaderSnapshotToModel(model, data)
		})
}

function prepareCleaningHeaderSnapshot(
	data: PermitFieldData["cleaningHeader"],
) {
	return database
		.get<CleaningHeaderModel>("cleaningHeader")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyCleaningHeaderSnapshotToModel(model, data)
		})
}

function prepareParticipantSnapshot(
	data: PermitFieldData["participants"][number],
) {
	return database
		.get<ParticipantModel>("participants")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyParticipantSnapshotToModel(model, data)
		})
}

function prepareShearingRecordSnapshot(
	data: PermitFieldData["shearingRecords"][number],
) {
	return database
		.get<ShearingRecordModel>("shearingRecord")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyShearingRecordSnapshotToModel(model, data)
		})
}

function prepareCleaningCommonSnapshot(
	data: PermitFieldData["cleaningCommonRecords"][number],
) {
	return database
		.get<CleaningCommonModel>("cleaningCommon")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyCleaningCommonSnapshotToModel(model, data)
		})
}

function prepareGroomingSnapshot(
	data: PermitFieldData["groomingDetails"][number],
) {
	return database.get<GroomingModel>("grooming").prepareCreate((model) => {
		model._raw.id = data.id
		applyGroomingSnapshotToModel(model, data)
	})
}

function prepareDehearingSnapshot(
	data: PermitFieldData["dehearingDetails"][number],
) {
	return database.get<DehearingModel>("dehearing").prepareCreate((model) => {
		model._raw.id = data.id
		applyDehearingSnapshotToModel(model, data)
	})
}
