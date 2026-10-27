import { updateShearingHeader as updateShearingHeaderData } from "@database"
import type { ShearingHeaderSaveData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import {
	finishDataOperation,
	tryStartDataOperation,
} from "@utils/data-operation-guard"
import { useCallback, useState } from "react"

export function useSingleShearingHeaderActions() {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const updateShearingHeader = useCallback(
		async (headerId: string, data: ShearingHeaderSaveData) => {
			if (!accountId) return false
			if (!tryStartDataOperation()) return false
			setSaving(true)
			setError(null)
			try {
				await updateShearingHeaderData(headerId, data, accountId)
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
		updateShearingHeader,
		saving,
		error,
		clearError,
	}
}
