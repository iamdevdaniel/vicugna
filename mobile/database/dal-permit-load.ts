import type {
	MobilePermitData,
	PermitFieldData,
	PermitStepStatus,
} from "@definitions/types"
import { type Model, Q } from "@nozbe/watermelondb"
import { getDependentStepStatus } from "@utils/misc"
import { applyPermitToModel, applySyncPermitToModel } from "./mappers"
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

let pendingSave: Promise<void> = Promise.resolve()

export function savePermits(downloads: MobilePermitData[]): Promise<void> {
	const operation = pendingSave.then(() => savePermitDownloads(downloads))
	pendingSave = operation.catch(() => undefined)
	return operation
}

async function savePermitDownloads(
	downloads: MobilePermitData[],
): Promise<void> {
	if (downloads.length === 0) return

	await database.write(async () => {
		const permitIds = downloads.map(({ permit }) => permit.id)
		const existingPermits = await database
			.get<PermitModel>("permits")
			.query(Q.where("id", Q.oneOf(permitIds)))
			.fetch()
		const permitsById = new Map(
			existingPermits.map((permit) => [permit.id, permit]),
		)
		const currentDownloads = downloads.filter(({ permit, syncVersion }) => {
			const localVersion = permitsById.get(permit.id)?.syncVersion ?? 0
			return (syncVersion ?? 0) >= localVersion
		})
		if (currentDownloads.length === 0) return

		const currentPermitIds = currentDownloads.map(({ permit }) => permit.id)
		const [shearingHeaders, cleaningHeaders] = await Promise.all([
			database
				.get<ShearingHeaderModel>("shearingHeader")
				.query(Q.where("permitId", Q.oneOf(currentPermitIds)))
				.fetch(),
			database
				.get<CleaningHeaderModel>("cleaningHeader")
				.query(Q.where("permitId", Q.oneOf(currentPermitIds)))
				.fetch(),
		])
		const shearingHeadersByPermitId = new Map(
			shearingHeaders.map((header) => [header.permitId, header]),
		)
		const cleaningHeadersByPermitId = new Map(
			cleaningHeaders.map((header) => [header.permitId, header]),
		)
		const hydrationDownloads = currentDownloads.filter(
			({ permit, syncVersion, fieldData }) =>
				fieldData !== null &&
				syncVersion !== null &&
				syncVersion > (permitsById.get(permit.id)?.syncVersion ?? 0),
		)
		const hydrationIds = hydrationDownloads.map(({ permit }) => permit.id)
		const hydrationByPermitId = new Map(
			hydrationDownloads.map((download) => [
				download.permit.id,
				download,
			]),
		)
		const oldFieldData = await readFieldData(hydrationIds)
		const batchOps: Model[] = []
		prepareFieldDataDeletion(batchOps, new Set(hydrationIds), oldFieldData)

		for (const download of currentDownloads) {
			const { permit, syncVersion } = download
			const existingPermit = permitsById.get(permit.id)
			const hydration = hydrationByPermitId.get(permit.id)
			const statuses = hydration?.fieldData
				? getSnapshotStatuses(hydration.fieldData)
				: null

			if (existingPermit) {
				batchOps.push(
					existingPermit.prepareUpdate((model) => {
						applySyncPermitToModel(model, permit)
						model.syncVersion = syncVersion ?? 0
						if (statuses) applyStatuses(model, statuses)
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

			if (hydration?.fieldData) {
				prepareSnapshotReplacement(
					batchOps,
					hydration.fieldData,
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
				applyShearingHeaderSnapshot(model, data.shearingHeader),
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
				applyCleaningHeaderSnapshot(model, data.cleaningHeader),
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
	const participantsStatus: PermitStepStatus = data.participants.length
		? "done"
		: "ready"
	const shearingStatus = getDependentStepStatus(
		participantsStatus === "done",
		data.shearingRecords.length > 0,
	)
	if (shearingStatus !== "done") {
		return {
			participantsStatus,
			shearingStatus,
			cleaningStatus: "disabled" as const,
		}
	}

	const completedCleaningIds = new Set([
		...data.groomingDetails
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
		...data.dehearingDetails
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
	])
	const cleaningIsComplete =
		data.cleaningHeader.isCompleted &&
		data.cleaningCommonRecords.length > 0 &&
		data.cleaningCommonRecords.every((record) =>
			completedCleaningIds.has(record.id),
		)

	return {
		participantsStatus,
		shearingStatus,
		cleaningStatus: getDependentStepStatus(true, cleaningIsComplete),
	}
}

function applyStatuses(
	model: PermitModel,
	statuses: ReturnType<typeof getSnapshotStatuses>,
) {
	model.participantsStatus = statuses.participantsStatus
	model.shearingStatus = statuses.shearingStatus
	model.cleaningStatus = statuses.cleaningStatus
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

function applyShearingHeaderSnapshot(
	model: ShearingHeaderModel,
	data: PermitFieldData["shearingHeader"],
) {
	model.permitId = data.permitId
	model.site = data.site
	model.latitude = data.latitude
	model.longitude = data.longitude
	model.roundupCount = data.roundupCount
	model.eventDate = data.eventDate
	model.startTime = data.startTime
	model.endTime = data.endTime
	model.isCompleted = data.isCompleted
}

function prepareShearingHeaderSnapshot(
	data: PermitFieldData["shearingHeader"],
) {
	return database
		.get<ShearingHeaderModel>("shearingHeader")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyShearingHeaderSnapshot(model, data)
		})
}

function applyCleaningHeaderSnapshot(
	model: CleaningHeaderModel,
	data: PermitFieldData["cleaningHeader"],
) {
	model.permitId = data.permitId
	model.startDate = data.startDate
	model.endDate = data.endDate
	model.site = data.site
	model.supervisors = data.supervisors
	model.isCompleted = data.isCompleted
}

function prepareCleaningHeaderSnapshot(
	data: PermitFieldData["cleaningHeader"],
) {
	return database
		.get<CleaningHeaderModel>("cleaningHeader")
		.prepareCreate((model) => {
			model._raw.id = data.id
			applyCleaningHeaderSnapshot(model, data)
		})
}

function prepareParticipantSnapshot(
	data: PermitFieldData["participants"][number],
) {
	return database
		.get<ParticipantModel>("participants")
		.prepareCreate((model) => {
			model._raw.id = data.id
			model.permitId = data.permitId
			model.name = data.name
			model.lastNames = data.lastNames
			model.gender = data.gender
			model.identityNumber = data.identityNumber
			model.signature = data.signature
			model.notes = data.notes
		})
}

function prepareShearingRecordSnapshot(
	data: PermitFieldData["shearingRecords"][number],
) {
	return database
		.get<ShearingRecordModel>("shearingRecord")
		.prepareCreate((model) => {
			model._raw.id = data.id
			model.permitId = data.permitId
			model.tagNumber = data.tagNumber
			model.sex = data.sex
			model.ageCategory = data.ageCategory
			model.liveWeight = data.liveWeight
			model.fiberLength = data.fiberLength
			model.bodyCondition = data.bodyCondition
			model.gestationStatus = data.gestationStatus
			model.externalParasites = data.externalParasites
			model.mangeSeverity = data.mangeSeverity
			model.hasDandruff = data.hasDandruff
			model.isSheared = data.isSheared
			model.isDead = data.isDead
			model.observations = data.observations
		})
}

function prepareCleaningCommonSnapshot(
	data: PermitFieldData["cleaningCommonRecords"][number],
) {
	return database
		.get<CleaningCommonModel>("cleaningCommon")
		.prepareCreate((model) => {
			model._raw.id = data.id
			model.permitId = data.permitId
			model.fleeceNumber = data.fleeceNumber
			model.grossWeight = data.grossWeight
		})
}

function prepareGroomingSnapshot(
	data: PermitFieldData["groomingDetails"][number],
) {
	return database.get<GroomingModel>("grooming").prepareCreate((model) => {
		model._raw.id = data.id
		model.cleaningCommonId = data.cleaningCommonId
		model.cleanWeight = data.cleanWeight
		model.dirtyWeight = data.dirtyWeight
		model.totalWeight = data.totalWeight
		model.isCompleted = data.isCompleted
	})
}

function prepareDehearingSnapshot(
	data: PermitFieldData["dehearingDetails"][number],
) {
	return database.get<DehearingModel>("dehearing").prepareCreate((model) => {
		model._raw.id = data.id
		model.cleaningCommonId = data.cleaningCommonId
		model.dehairedWeight = data.dehairedWeight
		model.bristleWeight = data.bristleWeight
		model.hasDandruff = data.hasDandruff
		model.dehairerName = data.dehairerName
		model.signature = data.signature
		model.isCompleted = data.isCompleted
	})
}
