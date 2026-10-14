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
	const expectedResponseVersion = getExpectedResponseVersion(
		data.expectedSyncVersion,
	)

	const hasExpectedVersion =
		Number.isSafeInteger(result?.syncVersion) &&
		result.syncVersion === expectedResponseVersion
	const hasValidSyncTime =
		typeof result?.syncedAt === "string" &&
		!Number.isNaN(Date.parse(result.syncedAt))

	if (
		!result ||
		typeof result !== "object" ||
		result.permitId !== data.permit.id ||
		result.syncStatus !== "synced" ||
		!hasExpectedVersion ||
		!hasValidSyncTime
	) {
		throw new BackendRequestError(
			"invalid_response",
			"El servidor devolvió una respuesta inválida. Intente nuevamente.",
		)
	}

	return result
}

function getExpectedResponseVersion(expectedSyncVersion: number | null) {
	if (expectedSyncVersion === null) return 1
	return expectedSyncVersion + 1
}
