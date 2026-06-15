import {
	createSingleGrooming as createSingleGroomingData,
	deleteSingleGrooming as deleteSingleGroomingData,
	updateSingleGrooming as updateSingleGroomingData,
} from "@database"
import type { GroomingFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleGroomingActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleGrooming = useCallback(
		async (cleaningCommonId: string, data: GroomingFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createSingleGroomingData(cleaningCommonId, data)
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

	const updateSingleGrooming = useCallback(
		async (groomingId: string, data: GroomingFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleGroomingData(groomingId, data)
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

	const deleteSingleGrooming = useCallback(async (groomingId: string) => {
		setDeleting(true)
		setError(null)
		try {
			await deleteSingleGroomingData(groomingId)
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
		createSingleGrooming,
		updateSingleGrooming,
		deleteSingleGrooming,
		saving,
		deleting,
		error,
		clearError,
	}
}
