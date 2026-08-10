import { fetchPermits } from "@api"
import { savePermits } from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useRef, useState } from "react"

type PermitLoadResult = { ok: true } | { ok: false; error: string }

export function useLoadPermits() {
	const [loadingPermits, setLoadingPermits] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const isLoadRunning = useRef(false)
	const token = useMobileAuthStore((state) => state.token)

	const loadPermits = useCallback(async (): Promise<PermitLoadResult> => {
		if (isLoadRunning.current) {
			return {
				ok: false,
				error: "La actualización de permisos ya está en curso",
			}
		}

		if (!token) {
			const message = "Sesión no disponible"
			setError(message)
			return { ok: false, error: message }
		}

		isLoadRunning.current = true
		setLoadingPermits(true)
		setError(null)

		try {
			const permits = await fetchPermits(token)
			await savePermits(permits)
			return { ok: true }
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudieron cargar los permisos"
			setError(message)
			return { ok: false, error: message }
		} finally {
			isLoadRunning.current = false
			setLoadingPermits(false)
		}
	}, [token])

	const clearError = useCallback(() => setError(null), [])

	return {
		loadPermits,
		loadingPermits,
		error,
		clearError,
	}
}
