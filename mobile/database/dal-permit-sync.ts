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
import { randomId } from "@nozbe/watermelondb/utils/common"
import { getPermitStatuses } from "@utils/permit-status-rules"
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
	mapToSyncPermit,
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

export async function getFieldSyncData(
	permitId: string,
	accountId: string,
): Promise<SyncFieldData> {
	try {
		const permitRecord = await database
			.get<PermitModel>("permits")
			.find(permitId)
		assertPermitOwner(permitRecord.userId, accountId)
		const syncAttemptId = permitRecord.syncAttemptId
		if (!syncAttemptId) {
			throw new Error("Este permiso no tiene un envío pendiente")
		}

		return await buildFieldSyncData(permitRecord, syncAttemptId)
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.readData)
	}
}

// ==========================================
// WRITE
// ==========================================

export async function preparePermitSyncAttempt(
	permitId: string,
	accountId: string,
): Promise<SyncFieldData> {
	try {
		return await database.write(async () => {
			const permitRecord = await database
				.get<PermitModel>("permits")
				.find(permitId)
			assertPermitOwner(permitRecord.userId, accountId)
			if (permitRecord.syncAttemptId) {
				throw new Error("Este permiso ya tiene un envío pendiente")
			}

			const syncAttemptId = randomId()
			const payload = await buildFieldSyncData(
				permitRecord,
				syncAttemptId,
			)

			await permitRecord.update((permit) => {
				permit.syncAttemptId = syncAttemptId
			})

			return payload
		})
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.startAttempt)
	}
}

export async function clearPermitSyncAttempt(
	permitId: string,
	accountId: string,
): Promise<void> {
	try {
		await updateOwnedPermit(permitId, accountId, (permit) => {
			permit.syncAttemptId = null
		})
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.clearAttempt)
	}
}

export async function completePermitSyncAttempt(
	result: PermitSyncResult,
	accountId: string,
): Promise<void> {
	try {
		await updateOwnedPermit(result.permitId, accountId, (permit) => {
			permit.syncedAt = result.syncedAt
			permit.syncVersion = result.syncVersion
			permit.permitSyncStatus = result.syncStatus
			permit.syncAttemptId = null
		})
	} catch {
		throw new MobileOperationError(mobilePermitSyncErrors.completeAttempt)
	}
}

export async function savePermits(
	accountId: string,
	downloads: MobilePermitData[],
	options: { confirmedReplacementId?: string } = {},
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
		const downloadsToSave = downloads.filter(({ permit, syncVersion }) => {
			const existingPermit = permitsById.get(permit.id)
			if (existingPermit?.syncAttemptId) return false

			const localVersion = existingPermit?.syncVersion ?? 0
			const backendVersion = syncVersion ?? 0

			if (backendVersion < localVersion) return false
			if (permit.id === options.confirmedReplacementId) return true

			return !(
				existingPermit &&
				existingPermit.permitSyncStatus !== "synced" &&
				backendVersion > localVersion
			)
		})
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
		const downloadsReplacingLocalData = downloadsToSave.filter(
			({ permit, syncVersion, fieldData }) =>
				fieldData !== null &&
				syncVersion !== null &&
				syncVersion > (permitsById.get(permit.id)?.syncVersion ?? 0),
		)
		const replacementPermitIds = downloadsReplacingLocalData.map(
			({ permit }) => permit.id,
		)
		const replacementsByPermitId = new Map(
			downloadsReplacingLocalData.map((download) => [
				download.permit.id,
				download,
			]),
		)
		const oldFieldData = await readFieldData(replacementPermitIds)
		const batchOps: Model[] = []
		prepareFieldDataDeletion(
			batchOps,
			new Set(replacementPermitIds),
			oldFieldData,
		)

		for (const download of downloadsToSave) {
			const { permit, syncVersion } = download
			const existingPermit = permitsById.get(permit.id)
			const replacement = replacementsByPermitId.get(permit.id)
			const statuses = replacement?.fieldData
				? getSnapshotStatuses(replacement.fieldData)
				: null

			if (existingPermit) {
				batchOps.push(
					existingPermit.prepareUpdate((model) => {
						applySyncPermitToModel(model, permit)
						model.syncVersion = syncVersion ?? 0
						if (statuses)
							applyPermitStatusesToModel(model, statuses)
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
							model.syncVersion = syncVersion ?? 0
						}),
				)
			}

			if (replacement?.fieldData) {
				prepareSnapshotReplacement(
					batchOps,
					replacement.fieldData,
					shearingHeadersByPermitId.get(permit.id),
					cleaningHeadersByPermitId.get(permit.id),
				)
				continue
			}

			if (!existingPermit) {
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
	syncAttemptId: string,
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

	return {
		syncAttemptId,
		expectedSyncVersion: permitRecord.syncVersion || null,
		permit: mapToSyncPermit(permitRecord),
		participants: participants.map(mapToParticipant),
		shearingHeader: mapToShearingHeader(shearingHeader),
		shearingRecords: shearingRecords.map(mapToShearingRecord),
		cleaningHeader: mapToCleaningHeader(cleaningHeader),
		cleaningCommonRecords: cleaningCommonRecords.map(mapToCleaningCommon),
		groomingDetails: groomingDetails.map(mapToGrooming),
		dehearingDetails: dehearingDetails.map(mapToDehearing),
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

async function readFieldData(permitIds: string[]) {
	if (permitIds.length === 0) {
		return {
			participants: [] as ParticipantModel[],
			shearingRecords: [] as ShearingRecordModel[],
			cleaningCommonRecords: [] as CleaningCommonModel[],
			groomingDetails: [] as GroomingModel[],
			dehearingDetails: [] as DehearingModel[],
		}
	}

	const [participants, shearingRecords, cleaningCommonRecords] =
		await Promise.all([
			database
				.get<ParticipantModel>("participants")
				.query(Q.where("permitId", Q.oneOf(permitIds)))
				.fetch(),
			database
				.get<ShearingRecordModel>("shearingRecord")
				.query(Q.where("permitId", Q.oneOf(permitIds)))
				.fetch(),
			database
				.get<CleaningCommonModel>("cleaningCommon")
				.query(Q.where("permitId", Q.oneOf(permitIds)))
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
		shearingRecords,
		cleaningCommonRecords,
		groomingDetails,
		dehearingDetails,
	}
}

type StoredFieldData = Awaited<ReturnType<typeof readFieldData>>

function prepareFieldDataDeletion(
	batchOps: Model[],
	permitIds: Set<string>,
	oldData: StoredFieldData,
) {
	const cleaningCommonIds = new Set(
		oldData.cleaningCommonRecords
			.filter((record) => permitIds.has(record.permitId))
			.map((record) => record.id),
	)
	batchOps.push(
		...oldData.participants
			.filter((record) => permitIds.has(record.permitId))
			.map((record) => record.prepareDestroyPermanently()),
		...oldData.shearingRecords
			.filter((record) => permitIds.has(record.permitId))
			.map((record) => record.prepareDestroyPermanently()),
		...oldData.groomingDetails
			.filter((record) => cleaningCommonIds.has(record.cleaningCommonId))
			.map((record) => record.prepareDestroyPermanently()),
		...oldData.dehearingDetails
			.filter((record) => cleaningCommonIds.has(record.cleaningCommonId))
			.map((record) => record.prepareDestroyPermanently()),
		...oldData.cleaningCommonRecords
			.filter((record) => permitIds.has(record.permitId))
			.map((record) => record.prepareDestroyPermanently()),
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
