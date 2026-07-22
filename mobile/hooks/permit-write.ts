import { submitSyncFieldData } from "@api"
import { getFieldSyncData, updatePermitSyncStatus } from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useState } from "react"

export function useSyncPermit() {
	const [syncingPermit, setSyncingPermit] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const token = useMobileAuthStore((state) => state.token)

	const syncPermit = useCallback(
		async (permitId: string) => {
			if (!token) {
				const message = "Debes iniciar sesion para enviar este permiso"
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
				setError(message)
				return { ok: false, error: message }
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
