import type { ParticipantFormData } from "@definitions/types"
import {
	getWebSessionSnapshot,
	isWebSessionCurrent,
} from "@utils/auth-store.web"
import { useCallback, useRef, useState } from "react"
import {
	createSingleParticipant as createParticipantData,
	deleteSingleParticipant as deleteParticipantData,
	updateSingleParticipant as updateParticipantData,
} from "../database/index.web"

export function useSingleParticipantActions() {
	const operationInFlight = useRef(false)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const run = useCallback(
		async (
			operation: (accountId: string) => Promise<void>,
			kind: "save" | "delete",
		) => {
			if (operationInFlight.current) return false
			const session = getWebSessionSnapshot()
			if (!session) {
				setError(new Error("Sesión no disponible"))
				return false
			}

			operationInFlight.current = true
			setError(null)
			if (kind === "save") setSaving(true)
			else setDeleting(true)

			try {
				await operation(session.accountId)
				return isWebSessionCurrent(session)
			} catch (caught) {
				if (!isWebSessionCurrent(session)) return false

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
			run(async (accountId) => {
				await createParticipantData(accountId, permitId, data)
			}, "save"),
		[run],
	)

	const updateSingleParticipant = useCallback(
		(participantId: string, data: ParticipantFormData) =>
			run(async (accountId) => {
				await updateParticipantData(accountId, participantId, data)
			}, "save"),
		[run],
	)

	const deleteSingleParticipant = useCallback(
		(participantId: string) =>
			run(async (accountId) => {
				await deleteParticipantData(accountId, participantId)
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
