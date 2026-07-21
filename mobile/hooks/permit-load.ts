import { fetchPermits } from "@api"
import { savePermits } from "@database"
import { useCallback, useState } from "react"

export function useLoadPermits() {
	const [loadingPermits, setLoadingPermits] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadPermits = useCallback(async (token: string) => {
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
	}, [])

	const clearError = useCallback(() => setError(null), [])

	return {
		loadPermits,
		loadingPermits,
		error,
		clearError,
	}
}
