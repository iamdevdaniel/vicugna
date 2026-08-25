import {
	createSingleCleaningRecord as createCleaningRecordData,
	deleteSingleCleaningRecord as deleteSingleCleaningRecordData,
	updateSingleCleaningRecord as updateCleaningRecordData,
} from "@database"
import type {
	CleaningCommonFormData,
	CleaningRecordSaveData,
} from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleCleaningRecordActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleCleaningRecord = useCallback(
		async (permitId: string, data: CleaningCommonFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createCleaningRecordData(permitId, data)
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

	const updateSingleCleaningRecord = useCallback(
		async (cleaningCommonId: string, data: CleaningRecordSaveData) => {
			setSaving(true)
			setError(null)
			try {
				await updateCleaningRecordData(cleaningCommonId, data)
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

	const deleteSingleCleaningRecord = useCallback(
		async (cleaningCommonId: string) => {
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleCleaningRecordData(cleaningCommonId)
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
		createSingleCleaningRecord,
		updateSingleCleaningRecord,
		deleteSingleCleaningRecord,
		saving,
		deleting,
		error,
		clearError,
	}
}
