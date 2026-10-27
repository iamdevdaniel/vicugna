import {
	mobilePermitSyncErrors,
	mobileRequestErrors,
} from "@definitions/errors"
import type { MobilePermitData, PermitData } from "@definitions/types"
import {
	PermitDataValidationError,
	parseCompletePermitData,
} from "@vicugna/shared/permit-data-validation"
import { BackendRequestError, requestBackend } from "./backend-request"

const supportedPermitHashVersion = 1
const sha256Pattern = /^[0-9a-f]{64}$/

export async function fetchPermits(token: string) {
	const result = await requestBackend<unknown>(
		"/mobile/permits",
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		"No se pudieron cargar los permisos",
	)

	if (!Array.isArray(result)) throwInvalidResponse()
	const downloads = result.map((download) => parsePermitDownload(download))
	const permitIds = downloads.map(({ permit }) => permit.id)
	if (new Set(permitIds).size !== permitIds.length) throwInvalidResponse()

	return downloads
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

	return parsePermitDownload(result, permitId)
}

// ==========================================
// RESPONSE VALIDATION
// ==========================================

function parsePermitDownload(
	value: unknown,
	expectedPermitId?: string,
): MobilePermitData {
	if (!isObject(value)) throwInvalidResponse()
	if (!isValidPermitData(value.permit, expectedPermitId)) {
		throwInvalidResponse()
	}
	if (
		typeof value.serverHash !== "string" ||
		!sha256Pattern.test(value.serverHash)
	) {
		throwInvalidResponse()
	}
	if (
		typeof value.hashVersion === "number" &&
		Number.isSafeInteger(value.hashVersion) &&
		value.hashVersion > 0 &&
		value.hashVersion !== supportedPermitHashVersion
	) {
		throw new BackendRequestError(
			mobilePermitSyncErrors.unsupportedHashVersion.code,
			mobilePermitSyncErrors.unsupportedHashVersion.message,
		)
	}
	if (value.hashVersion !== supportedPermitHashVersion) {
		throwInvalidResponse()
	}

	const permit = value.permit
	const requiresCompleteFieldData =
		permit.syncStatus === "synced" || permit.syncStatus === "reopened"
	if (requiresCompleteFieldData && permit.syncedAt === null) {
		throwInvalidResponse()
	}
	if (value.fieldData === null) {
		if (requiresCompleteFieldData) throwInvalidResponse()
		return {
			permit,
			serverHash: value.serverHash,
			hashVersion: value.hashVersion,
			fieldData: null,
		}
	}
	if (!requiresCompleteFieldData) throwInvalidResponse()

	try {
		return {
			permit,
			serverHash: value.serverHash,
			hashVersion: value.hashVersion,
			fieldData: parseCompletePermitData(value.fieldData, permit.id),
		}
	} catch (error) {
		if (error instanceof PermitDataValidationError) throwInvalidResponse()
		throw error
	}
}

function isValidPermitData(
	value: unknown,
	expectedPermitId?: string,
): value is PermitData {
	if (!isObject(value)) return false

	return (
		isNonBlankText(value.id) &&
		(expectedPermitId === undefined || value.id === expectedPermitId) &&
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

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonBlankText(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0
}

function throwInvalidResponse(): never {
	throw new BackendRequestError(
		mobileRequestErrors.invalidResponse.code,
		mobileRequestErrors.invalidResponse.message,
	)
}
