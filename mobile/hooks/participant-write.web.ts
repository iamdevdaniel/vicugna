import type { ParticipantFormData } from "@definitions/types"
import { useCallback, useRef, useState } from "react"
import {
	createSingleParticipant as createParticipantData,
	deleteSingleParticipant as deleteParticipantData,
	FEASIBILITY_ACCOUNT_ID,
	updateSingleParticipant as updateParticipantData,
} from "../database/index.web"

export function useSingleParticipantActions() {
	const operationInFlight = useRef(false)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const run = useCallback(
		async (operation: () => Promise<void>, kind: "save" | "delete") => {
			if (operationInFlight.current) return false

			operationInFlight.current = true
			setError(null)
			if (kind === "save") setSaving(true)
			else setDeleting(true)

			try {
				await operation()
				return true
			} catch (caught) {
				setError(
					caught instanceof Error
						? caught
						: new Error("No se pudo guardar el participante"),
				)
				return false
			} finally {
				operationInFlight.current = false
				if (kind === "save") setSaving(false)
				else setDeleting(false)
			}
		},
		[],
	)

	const createSingleParticipant = useCallback(
		(permitId: string, data: ParticipantFormData) =>
			run(async () => {
				await createParticipantData(
					FEASIBILITY_ACCOUNT_ID,
					permitId,
					data,
				)
			}, "save"),
		[run],
	)

	const updateSingleParticipant = useCallback(
		(participantId: string, data: ParticipantFormData) =>
			run(async () => {
				await updateParticipantData(
					FEASIBILITY_ACCOUNT_ID,
					participantId,
					data,
				)
			}, "save"),
		[run],
	)

	const deleteSingleParticipant = useCallback(
		(participantId: string) =>
			run(async () => {
				await deleteParticipantData(
					FEASIBILITY_ACCOUNT_ID,
					participantId,
				)
			}, "delete"),
		[run],
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
