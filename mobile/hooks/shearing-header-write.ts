import { updateShearingHeader as updateShearingHeaderData } from "@database"
import type { ShearingHeaderSaveData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleShearingHeaderActions() {
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const updateShearingHeader = useCallback(
		async (headerId: string, data: ShearingHeaderSaveData) => {
			setSaving(true)
			setError(null)
			try {
				await updateShearingHeaderData(headerId, data)
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
		updateShearingHeader,
		saving,
		error,
		clearError,
	}
}
