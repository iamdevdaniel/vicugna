import { submitSyncFieldData } from "@api"
import { getFieldSyncData, updatePermitSyncStatus } from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useState } from "react"
import { BackendRequestError } from "../api/backend-request"

type SyncPermitResult = { ok: true } | { ok: false; error: string }

export function useSyncPermit() {
	const [syncingPermit, setSyncingPermit] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const token = useMobileAuthStore((state) => state.token)

	const syncPermit = useCallback(
		async (permitId: string): Promise<SyncPermitResult> => {
			if (!token) {
				const message = "Debes iniciar sesión para enviar este permiso"
				setError(message)
				return { ok: false, error: message }
			}

			setSyncingPermit(true)
			setError(null)

			try {
				const payload = await getFieldSyncData(permitId)
				const result = await submitSyncFieldData(token, payload)
				await updatePermitSyncStatus(result)
				return { ok: true }
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "No se pudo enviar el permiso"
				const syncError =
					error instanceof BackendRequestError && error.code
						? {
								error: `${message} (${error.code})`,
							}
						: { error: message }
				setError(syncError.error)
				return { ok: false, ...syncError }
			} finally {
				setSyncingPermit(false)
			}
		},
		[token],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		syncPermit,
		syncingPermit,
		error,
		clearError,
	}
}
