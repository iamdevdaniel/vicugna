import {
	createSingleDehearing as createSingleDehearingData,
	deleteSingleDehearing as deleteSingleDehearingData,
	updateSingleDehearing as updateSingleDehearingData,
} from "@database"
import type { DehearingFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleDehearingActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleDehearing = useCallback(
		async (cleaningCommonId: string, data: DehearingFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createSingleDehearingData(cleaningCommonId, data)
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

	const updateSingleDehearing = useCallback(
		async (dehearingId: string, data: DehearingFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleDehearingData(dehearingId, data)
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

	const deleteSingleDehearing = useCallback(async (dehearingId: string) => {
		setDeleting(true)
		setError(null)
		try {
			await deleteSingleDehearingData(dehearingId)
			return true
		} catch (e) {
			setError(e as Error)
			return false
		} finally {
			setDeleting(false)
		}
	}, [])

	const clearError = useCallback(() => setError(null), [])

	return {
		createSingleDehearing,
		updateSingleDehearing,
		deleteSingleDehearing,
		saving,
		deleting,
		error,
		clearError,
	}
}
