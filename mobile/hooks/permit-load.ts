import { fetchPermits } from "@api"
import { savePermits } from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useState } from "react"

export function useLoadPermits() {
	const [loadingPermits, setLoadingPermits] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const token = useMobileAuthStore((state) => state.token)

	const loadPermits = useCallback(async () => {
		if (!token) {
			setError("Sesión no disponible")
			return false
		}

		setLoadingPermits(true)
		setError(null)

		try {
			const permits = await fetchPermits(token)
			await savePermits(permits)
			return true
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "No se pudieron cargar los permisos",
			)
			return false
		} finally {
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
