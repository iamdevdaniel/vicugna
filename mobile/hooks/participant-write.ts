import {
	createSingleParticipant as createSingleParticipantData,
	deleteSingleParticipant as deleteSingleParticipantData,
	updateSingleParticipant as updateSingleParticipantData,
} from "@database"
import type { ParticipantFormData } from "@definitions/types"
import { useCallback, useState } from "react"

export function useSingleParticipantActions() {
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const createSingleParticipant = useCallback(
		async (permitId: string, data: ParticipantFormData) => {
			setSaving(true)
			setError(null)
			try {
				await createSingleParticipantData(permitId, data)
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

	const updateSingleParticipant = useCallback(
		async (participantId: string, data: ParticipantFormData) => {
			setSaving(true)
			setError(null)
			try {
				await updateSingleParticipantData(participantId, data)
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

	const deleteSingleParticipant = useCallback(
		async (participantId: string) => {
			setDeleting(true)
			setError(null)
			try {
				await deleteSingleParticipantData(participantId)
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
		createSingleParticipant,
		updateSingleParticipant,
		deleteSingleParticipant,
		saving,
		deleting,
		error,
		clearError,
	}
}
