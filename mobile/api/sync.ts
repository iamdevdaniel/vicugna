import { mobileRequestErrors } from "@definitions/errors"
import type { PermitSyncResult, SyncFieldData } from "@definitions/types"
import { BackendRequestError, requestBackend } from "./backend-request"

export async function submitSyncFieldData(token: string, data: SyncFieldData) {
	const result = await requestBackend<PermitSyncResult>(
		"/permits/sync",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		},
		"No se pudo enviar el permiso",
	)
	const hasValidHash =
		typeof result?.serverHash === "string" &&
		/^[0-9a-f]{64}$/.test(result.serverHash)
	const hasExpectedHashVersion =
		Number.isSafeInteger(result?.hashVersion) &&
		result.hashVersion === data.hashVersion
	const hasValidSyncTime =
		result?.syncedAt === null ||
		(typeof result?.syncedAt === "string" &&
			!Number.isNaN(Date.parse(result.syncedAt)))
	const hasValidSyncStatus =
		result?.syncStatus === "in_progress" ||
		result?.syncStatus === "synced" ||
		result?.syncStatus === "reopened"

	if (
		!result ||
		typeof result !== "object" ||
		result.permitId !== data.permitId ||
		!hasValidSyncStatus ||
		!hasValidHash ||
		!hasExpectedHashVersion ||
		!hasValidSyncTime
	) {
		throw new BackendRequestError(
			mobileRequestErrors.invalidResponse.code,
			mobileRequestErrors.invalidResponse.message,
		)
	}

	return result
}
