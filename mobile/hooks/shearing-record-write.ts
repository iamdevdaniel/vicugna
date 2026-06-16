import {
	createSingleShearingRecord as createSingleShearingRecordData,
	deleteSingleShearingRecord as deleteSingleShearingRecordData,
	updateSingleShearingRecord as updateSingleShearingRecordData,
} from "@database"
import type { ShearingRecordFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleShearingRecordActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleShearingRecord = useCallback(
		async (permitId: string, data: ShearingRecordFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createSingleShearingRecordData(permitId, data)
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

	const updateSingleShearingRecord = useCallback(
		async (recordId: string, data: ShearingRecordFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleShearingRecordData(recordId, data)
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

	const deleteSingleShearingRecord = useCallback(async (recordId: string) => {
		setDeleting(true)
		setError(null)
		try {
			await deleteSingleShearingRecordData(recordId)
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
		createSingleShearingRecord,
		updateSingleShearingRecord,
		deleteSingleShearingRecord,
		saving,
		deleting,
		error,
		clearError,
	}
}
