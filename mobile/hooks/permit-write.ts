import { initializePermits as initializePermitsData } from "@database"
import { useCallback, useState } from "react"

export function usePermitActions() {
	const [initializing , setInitializing] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const initializePermits = useCallback(async (permitIds: string[]) => {
		setInitializing(true)
		setError(null)
		try {
			await initializePermitsData(permitIds)
			return true
		} catch (e) {
			setError(e as Error)
			return false
		} finally {
			setInitializing(false)
		}
	}, [])

	const clearError = useCallback(() => setError(null), [])

	return {
		initializePermits,
		initializing ,
		error,
		clearError,
	}
}
