import {
	createSingleCleaningCommon as createSingleCleaningCommonData,
	deleteSingleCleaningCommon as deleteSingleCleaningCommonData,
	updateSingleCleaningCommon as updateSingleCleaningCommonData,
} from "@database"
import type { CleaningCommonFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleCleaningCommonActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleCleaningCommon = useCallback(
		async (permitId: string, data: CleaningCommonFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createSingleCleaningCommonData(permitId, data)
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

	const updateSingleCleaningCommon = useCallback(
		async (cleaningCommonId: string, data: CleaningCommonFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleCleaningCommonData(cleaningCommonId, data)
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

	const deleteSingleCleaningCommon = useCallback(
		async (cleaningCommonId: string) => {
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleCleaningCommonData(cleaningCommonId)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				setDeleting(false)
			}
		},
		[],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		createSingleCleaningCommon,
		updateSingleCleaningCommon,
		deleteSingleCleaningCommon,
		saving,
		deleting,
		error,
		clearError,
	}
}
