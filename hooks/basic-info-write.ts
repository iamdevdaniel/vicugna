import {
	updateSingleBasicInfo as updateSingleBasicInfoData,
} from "@database"
import type { BasicInfoFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleBasicInfoActions() {
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const updateSingleBasicInfo = useCallback(
		async (basicInfoId: string, data: BasicInfoFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleBasicInfoData(basicInfoId, data)
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
		updateSingleBasicInfo,
		saving,
		error,
		clearError,
	}
}
