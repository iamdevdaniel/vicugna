import {
	createSingleCleaningRecord as createCleaningRecordData,
	deleteSingleCleaningRecord as deleteSingleCleaningRecordData,
	updateSingleCleaningRecord as updateCleaningRecordData,
} from "@database"
import type {
	CleaningCommonFormData,
	CleaningRecordSaveData,
} from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import {
	finishDataOperation,
	tryStartDataOperation,
} from "@utils/data-operation-guard"
import { useCallback, useState } from "react"

export function useSingleCleaningRecordActions() {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleCleaningRecord = useCallback(
		async (permitId: string, data: CleaningCommonFormData) => {
			if (!accountId) return false
			if (!tryStartDataOperation()) return false
			setSaving(true)
			setError(null)
			try {
				await createCleaningRecordData(permitId, data, accountId)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				finishDataOperation()
				setSaving(false)
			}
		},
		[accountId],
	)

	const updateSingleCleaningRecord = useCallback(
		async (cleaningCommonId: string, data: CleaningRecordSaveData) => {
			if (!accountId) return false
			if (!tryStartDataOperation()) return false
			setSaving(true)
			setError(null)
			try {
				await updateCleaningRecordData(
					cleaningCommonId,
					data,
					accountId,
				)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				finishDataOperation()
				setSaving(false)
			}
		},
		[accountId],
	)

	const deleteSingleCleaningRecord = useCallback(
		async (cleaningCommonId: string) => {
			if (!accountId) return false
			if (!tryStartDataOperation()) return false
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleCleaningRecordData(
					cleaningCommonId,
					accountId,
				)
				return true
			} catch (e) {
				setError(e as Error)
				return false
			} finally {
				finishDataOperation()
				setDeleting(false)
			}
		},
		[accountId],
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
