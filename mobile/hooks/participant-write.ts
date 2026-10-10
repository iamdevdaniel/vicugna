import {
	createSingleParticipant as createSingleParticipantData,
	deleteSingleParticipant as deleteSingleParticipantData,
	updateSingleParticipant as updateSingleParticipantData,
} from "@database"
import type { ParticipantFormData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useState } from "react"

export function useSingleParticipantActions() {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleParticipant = useCallback(
		async (permitId: string, data: ParticipantFormData) => {
			if (!accountId) return false
			setSaving(true)
			setError(null)
			try {
				await createSingleParticipantData(permitId, data, accountId)
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

	const updateSingleParticipant = useCallback(
		async (participantId: string, data: ParticipantFormData) => {
			if (!accountId) return false
			setSaving(true)
			setError(null)
			try {
				await updateSingleParticipantData(
					participantId,
					data,
					accountId,
				)
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

	const deleteSingleParticipant = useCallback(
		async (participantId: string) => {
			if (!accountId) return false
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleParticipantData(participantId, accountId)
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
		createSingleParticipant,
		updateSingleParticipant,
		deleteSingleParticipant,
		saving,
		deleting,
		error,
		clearError,
	}
}
