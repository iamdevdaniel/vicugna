import { savePermitSyncData } from "./permit.repository"
import type { PermitSyncData } from "./permit.types"

export async function syncPermitData(data: PermitSyncData) {
	validatePermit(data)
	validateBasicInfo(data)
	validateParticipants(data)
	validateShearing(data)
	validateCleaning(data)

	return savePermitSyncData(data)
}

function validatePermit(data: PermitSyncData): void {
	if (!data.permit.id) {
		throw new Error("Permit id is required")
	}
}

function validateBasicInfo(data: PermitSyncData): void {
	if (!data.basicInfo) {
		throw new Error("Basic info is required")
	}

	if (data.basicInfo.permitId !== data.permit.id) {
		throw new Error("Basic info permit id does not match")
	}
}

function validateParticipants(data: PermitSyncData): void {
	if (!data.participants.length) {
		throw new Error("There are no participants")
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		"Participant",
	)

	for (const participant of data.participants) {
		if (participant.permitId !== data.permit.id) {
			throw new Error("Participant permit id does not match")
		}
	}
}

function validateShearing(data: PermitSyncData): void {
	if (!data.shearingHeader) {
		throw new Error("Shearing header is required")
	}

	if (data.shearingHeader.permitId !== data.permit.id) {
		throw new Error("Shearing header permit id does not match")
	}

	if (!data.shearingRecords.length) {
		throw new Error("There are no shearing records")
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		"Shearing record",
	)

	for (const record of data.shearingRecords) {
		if (record.permitId !== data.permit.id) {
			throw new Error("Shearing record permit id does not match")
		}
	}
}

function validateCleaning(data: PermitSyncData): void {
	if (!data.cleaningHeader) {
		throw new Error("Cleaning header is required")
	}

	if (data.cleaningHeader.permitId !== data.permit.id) {
		throw new Error("Cleaning header permit id does not match")
	}

	if (!data.cleaningCommonRecords.length) {
		throw new Error("The cleaning records are empty")
	}

	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throw new Error(
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
			throw new Error("Cleaning common permit id does not match")
		}
	}

	const cleaningCommonIds = new Set(
		data.cleaningCommonRecords.map((record) => record.id),
	)
	const usedDetailIds = new Set<string>()

	for (const detail of data.groomingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new Error("Grooming detail has invalid cleaning common id")
		}

		usedDetailIds.add(detail.cleaningCommonId)
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningCommonIds.has(detail.cleaningCommonId)) {
			throw new Error("Dehearing detail has invalid cleaning common id")
		}

		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throw new Error(
				"A cleaning record cannot have both grooming and dehearing details",
			)
		}
	}
}

function ensureUniqueIds(ids: string[], label: string): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new Error(`${label} is duplicated in the sync payload`)
	}
}
