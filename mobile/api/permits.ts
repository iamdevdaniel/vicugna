import {
	mobilePermitSyncErrors,
	mobileRequestErrors,
} from "@definitions/errors"
import type {
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GroomingData,
	MobilePermitData,
	ParticipantData,
	PermitData,
	PermitFieldData,
	ShearingHeaderData,
	ShearingRecordData,
} from "@definitions/types"
import { BackendRequestError, requestBackend } from "./backend-request"

const supportedPermitHashVersion = 1
const sha256Pattern = /^[0-9a-f]{64}$/

export async function fetchPermits(token: string) {
	return requestBackend<MobilePermitData[]>(
		"/mobile/permits",
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		"No se pudieron cargar los permisos",
	)
}

export async function fetchPermit(token: string, permitId: string) {
	const result = await requestBackend<unknown>(
		`/mobile/permits/${encodeURIComponent(permitId)}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		"No se pudieron descargar los datos del permiso",
	)
	const receivedHashVersion = isObject(result)
		? result.hashVersion
		: undefined
	if (
		typeof receivedHashVersion === "number" &&
		Number.isSafeInteger(receivedHashVersion) &&
		receivedHashVersion > 0 &&
		receivedHashVersion !== supportedPermitHashVersion
	) {
		throw new BackendRequestError(
			mobilePermitSyncErrors.unsupportedHashVersion.code,
			mobilePermitSyncErrors.unsupportedHashVersion.message,
		)
	}

	if (!isValidPermitDownload(result, permitId)) {
		throw new BackendRequestError(
			mobileRequestErrors.invalidResponse.code,
			mobileRequestErrors.invalidResponse.message,
		)
	}

	return result
}

// ==========================================
// RESPONSE VALIDATION
// ==========================================

function isValidPermitDownload(
	value: unknown,
	expectedPermitId: string,
): value is MobilePermitData {
	if (!isObject(value)) return false
	if (!isValidPermitData(value.permit, expectedPermitId)) return false
	if (
		typeof value.serverHash !== "string" ||
		!sha256Pattern.test(value.serverHash)
	)
		return false
	if (value.hashVersion !== supportedPermitHashVersion) return false

	const requiresCompleteFieldData =
		value.permit.syncStatus === "synced" ||
		value.permit.syncStatus === "reopened"
	if (requiresCompleteFieldData && value.permit.syncedAt === null)
		return false
	if (value.fieldData === null) return !requiresCompleteFieldData
	if (!requiresCompleteFieldData) return false

	return isPermitFieldData(value.fieldData, expectedPermitId)
}

function isValidPermitData(
	value: unknown,
	expectedPermitId: string,
): value is PermitData {
	if (!isObject(value)) return false

	return (
		value.id === expectedPermitId &&
		isNonBlankText(value.permitNumber) &&
		isNonBlankText(value.seasonId) &&
		isNonBlankText(value.seasonName) &&
		isNonBlankText(value.communityId) &&
		isNonBlankText(value.regionalId) &&
		isNonBlankText(value.departmentId) &&
		isNonBlankText(value.userId) &&
		isNonBlankText(value.userFullName) &&
		isPermitSyncStatus(value.syncStatus) &&
		isNullableDateTime(value.syncedAt)
	)
}

function isPermitFieldData(
	value: unknown,
	permitId: string,
): value is PermitFieldData {
	if (!isObject(value)) return false
	if (!isArrayOf(value.participants, isParticipant)) return false
	if (!isShearingHeader(value.shearingHeader)) return false
	if (!isArrayOf(value.shearingRecords, isShearingRecord)) return false
	if (!isCleaningHeader(value.cleaningHeader)) return false
	if (!isArrayOf(value.cleaningCommonRecords, isCleaningCommon)) return false
	if (!isArrayOf(value.groomingDetails, isGroomingDetail)) return false
	if (!isArrayOf(value.dehearingDetails, isDehearingDetail)) return false
	if (value.participants.length === 0) return false
	if (!value.shearingHeader.isCompleted) return false
	if (value.shearingRecords.length === 0) return false
	if (!value.cleaningHeader.isCompleted) return false
	if (value.cleaningCommonRecords.length === 0) return false

	if (value.shearingHeader.permitId !== permitId) return false
	if (value.cleaningHeader.permitId !== permitId) return false
	if (!allBelongToPermit(value.participants, permitId)) return false
	if (!allBelongToPermit(value.shearingRecords, permitId)) return false
	if (!allBelongToPermit(value.cleaningCommonRecords, permitId)) return false
	if (!hasUniqueIds(value.participants)) return false
	if (!hasUniqueIds(value.shearingRecords)) return false
	if (!hasUniqueIds(value.cleaningCommonRecords)) return false
	if (!hasUniqueIds(value.groomingDetails)) return false
	if (!hasUniqueIds(value.dehearingDetails)) return false

	const cleaningIds = new Set(
		value.cleaningCommonRecords.map((record) => record.id),
	)
	const usedCleaningIds = new Set<string>()
	const details = [...value.groomingDetails, ...value.dehearingDetails]
	for (const detail of details) {
		if (!cleaningIds.has(detail.cleaningCommonId)) return false
		if (usedCleaningIds.has(detail.cleaningCommonId)) return false
		if (!detail.isCompleted) return false
		usedCleaningIds.add(detail.cleaningCommonId)
	}

	return usedCleaningIds.size === cleaningIds.size
}

function isParticipant(value: unknown): value is ParticipantData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.permitId) &&
		isText(value.name) &&
		isText(value.lastNames) &&
		(value.gender === "F" || value.gender === "M") &&
		isText(value.identityNumber) &&
		isText(value.signature) &&
		isText(value.notes)
	)
}

function isShearingHeader(value: unknown): value is ShearingHeaderData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.permitId) &&
		isText(value.site) &&
		isFiniteNumber(value.latitude) &&
		isFiniteNumber(value.longitude) &&
		Number.isSafeInteger(value.roundupCount) &&
		isText(value.eventDate) &&
		isText(value.startTime) &&
		isText(value.endTime) &&
		typeof value.isCompleted === "boolean"
	)
}

function isShearingRecord(value: unknown): value is ShearingRecordData {
	if (!isObject(value)) return false
	if (!Array.isArray(value.externalParasites)) return false
	if (
		!value.externalParasites.every(
			(parasite) => parasite === "Garrapata" || parasite === "Piojos",
		)
	)
		return false
	if (
		new Set(value.externalParasites).size !== value.externalParasites.length
	)
		return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.permitId) &&
		Number.isSafeInteger(value.tagNumber) &&
		(value.sex === "F" || value.sex === "M") &&
		["Cria", "Juvenil", "Adulto"].includes(String(value.ageCategory)) &&
		isFiniteNumber(value.liveWeight) &&
		isFiniteNumber(value.fiberLength) &&
		["Malo", "Regular", "Bueno"].includes(String(value.bodyCondition)) &&
		["No", "Si", "Si ultimo tercio"].includes(
			String(value.gestationStatus),
		) &&
		["Ninguna", "Leve", "Moderado", "Severo"].includes(
			String(value.mangeSeverity),
		) &&
		typeof value.hasDandruff === "boolean" &&
		typeof value.isSheared === "boolean" &&
		typeof value.isDead === "boolean" &&
		isText(value.observations)
	)
}

function isCleaningHeader(value: unknown): value is CleaningHeaderData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.permitId) &&
		isText(value.startDate) &&
		isText(value.endDate) &&
		isText(value.site) &&
		isText(value.supervisors) &&
		typeof value.isCompleted === "boolean"
	)
}

function isCleaningCommon(value: unknown): value is CleaningCommonData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.permitId) &&
		isText(value.fleeceNumber) &&
		isFiniteNumber(value.grossWeight)
	)
}

function isGroomingDetail(value: unknown): value is GroomingData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.cleaningCommonId) &&
		isFiniteNumber(value.cleanWeight) &&
		isFiniteNumber(value.dirtyWeight) &&
		isFiniteNumber(value.totalWeight) &&
		typeof value.isCompleted === "boolean"
	)
}

function isDehearingDetail(value: unknown): value is DehearingData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		isNonBlankText(value.cleaningCommonId) &&
		isFiniteNumber(value.dehairedWeight) &&
		isFiniteNumber(value.bristleWeight) &&
		typeof value.hasDandruff === "boolean" &&
		isText(value.dehairerName) &&
		isText(value.signature) &&
		typeof value.isCompleted === "boolean"
	)
}

function isPermitSyncStatus(value: unknown) {
	return [
		"created",
		"assigned",
		"in_progress",
		"synced",
		"reopened",
	].includes(String(value))
}

function isNullableDateTime(value: unknown) {
	return (
		value === null ||
		(typeof value === "string" && !Number.isNaN(Date.parse(value)))
	)
}

function allBelongToPermit(
	records: Array<{ permitId: string }>,
	permitId: string,
) {
	return records.every((record) => record.permitId === permitId)
}

function hasUniqueIds(records: Array<{ id: string }>) {
	return new Set(records.map((record) => record.id)).size === records.length
}

function isArrayOf<T>(
	value: unknown,
	isItem: (item: unknown) => item is T,
): value is T[] {
	return Array.isArray(value) && value.every(isItem)
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
	return typeof value === "string"
}

function isNonBlankText(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value)
}
