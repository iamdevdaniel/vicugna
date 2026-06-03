import { initializePermits as initializePermitsData } from "@database"
import { useCallback, useState } from "react"

export function usePermitActions() {
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const initializePermits = useCallback(async (permitIds: string[]) => {
		setSaving(true)
		setError(null)
		try {
			await initializePermitsData(permitIds)
			return true
		} catch (e) {
			setError(e as Error)
			return false
		} finally {
			setSaving(false)
		}
	}, [])

	const clearError = useCallback(() => setError(null), [])

	return {
		initializePermits,
		saving,
		error,
		clearError,
	}
}
