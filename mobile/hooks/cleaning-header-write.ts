import { updateSingleCleaningHeader as updateSingleCleaningHeaderData } from "@database"
import type { CleaningHeaderFormData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import {
	finishDataOperation,
	tryStartDataOperation,
} from "@utils/data-operation-guard"
import { useCallback, useState } from "react"

export function useSingleCleaningHeaderActions() {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const updateSingleCleaningHeader = useCallback(
		async (headerId: string, data: CleaningHeaderFormData) => {
			if (!accountId) return false
			if (!tryStartDataOperation()) return false
			setSaving(true)
			setError(null)
			try {
				await updateSingleCleaningHeaderData(headerId, data, accountId)
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

	const clearError = useCallback(() => setError(null), [])

	return {
		updateSingleCleaningHeader,
		saving,
		error,
		clearError,
	}
}
