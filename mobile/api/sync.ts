import type { PermitSyncResult, SyncFieldData } from "@definitions/types"
import { requestBackend } from "./backend-request"

export async function submitSyncFieldData(token: string, data: SyncFieldData) {
	return requestBackend<PermitSyncResult>(
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
}
