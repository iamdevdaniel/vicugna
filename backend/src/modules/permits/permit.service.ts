import { PermitValidationError } from "./permit.errors"
import type { SyncFieldData } from "./permit.types"

export async function submitSyncFieldData(data: SyncFieldData) {
	validatePermit(data)
	validateParticipants(data)
	validateShearing(data)
	validateCleaning(data)
	console.log("syncFieldData", JSON.stringify(data, null, 2))

	return {
		permitId: data.permit.id,
		isSynced: true,
		syncedAt: new Date().toISOString(),
	}
}

function validatePermit(data: SyncFieldData): void {
	if (!data.permit.id) {
		throw new PermitValidationError("Permit id is required")
	}
}

function validateParticipants(data: SyncFieldData): void {
	if (!data.participants.length) {
		throw new PermitValidationError("There are no participants")
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		"Participant",
	)

	for (const participant of data.participants) {
		if (participant.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"Participant permit id does not match",
			)
		}
	}
}

function validateShearing(data: SyncFieldData): void {
	if (!data.shearingHeader) {
		throw new PermitValidationError("Shearing header is required")
	}

	if (data.shearingHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			"Shearing header permit id does not match",
		)
	}

	if (!data.shearingRecords.length) {
		throw new PermitValidationError("There are no shearing records")
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		"Shearing record",
	)

	for (const record of data.shearingRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"Shearing record permit id does not match",
			)
		}
	}
}

function validateCleaning(data: SyncFieldData): void {
	if (!data.cleaningHeader) {
		throw new PermitValidationError("Cleaning header is required")
	}

	if (data.cleaningHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			"Cleaning header permit id does not match",
		)
	}

	if (!data.cleaningCommonRecords.length) {
		throw new PermitValidationError("The cleaning records are empty")
	}

	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throw new PermitValidationError(
			"Cleaning details count must match the number of cleaning common records",
		)
	}

	ensureUniqueIds(
		data.cleaningCommonRecords.map((record) => record.id),
		"Cleaning common record",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.cleaningCommonId),
		"Grooming cleaning common id",
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.id),
		"Grooming detail",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.cleaningCommonId),
		"Dehearing cleaning common id",
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.id),
		"Dehearing detail",
	)

	for (const record of data.cleaningCommonRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				"Cleaning common permit id does not match",
			)
		}
	}

	const cleaningCommonIds = new Set(
		data.cleaningCommonRecords.map((record) => record.id),
	)
	const usedDetailIds = new Set<string>()

	for (const detail of data.groomingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"Grooming detail has invalid cleaning common id",
			)
		}

		usedDetailIds.add(detail.cleaningCommonId)
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"Dehearing detail has invalid cleaning common id",
			)
		}

		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				"A cleaning record cannot have both grooming and dehearing details",
			)
		}
	}
}

function ensureUniqueIds(ids: string[], label: string): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new PermitValidationError(
			`${label} is duplicated in the sync payload`,
		)
	}
}
