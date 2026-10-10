import {
	createSingleShearingRecord as createSingleShearingRecordData,
	deleteSingleShearingRecord as deleteSingleShearingRecordData,
	updateSingleShearingRecord as updateSingleShearingRecordData,
} from "@database"
import type { ShearingRecordFormData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useState } from "react"

export function useSingleShearingRecordActions() {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleShearingRecord = useCallback(
		async (permitId: string, data: ShearingRecordFormData) => {
			if (!accountId) return false
			setSaving(true)
			setError(null)
			try {
				await createSingleShearingRecordData(permitId, data, accountId)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				setSaving(false)
			}
		},
		[accountId],
	)

	const updateSingleShearingRecord = useCallback(
		async (recordId: string, data: ShearingRecordFormData) => {
			if (!accountId) return false
			setSaving(true)
			setError(null)
			try {
				await updateSingleShearingRecordData(recordId, data, accountId)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				setSaving(false)
			}
		},
		[accountId],
	)

	const deleteSingleShearingRecord = useCallback(
		async (recordId: string) => {
			if (!accountId) return false
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleShearingRecordData(recordId, accountId)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				setDeleting(false)
			}
		},
		[accountId],
	)

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
