import { updateSingleCleaningHeader as updateSingleCleaningHeaderData } from "@database"
import type { CleaningHeaderFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleCleaningHeaderActions() {
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const updateSingleCleaningHeader = useCallback(
		async (headerId: string, data: CleaningHeaderFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleCleaningHeaderData(headerId, data)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				setSaving(false)
			}
		},
		[],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		updateSingleCleaningHeader,
		saving,
		error,
		clearError,
	}
}
