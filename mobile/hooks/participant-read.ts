import {
	subscribeBulkParticipants,
	subscribeSingleParticipant,
} from "@database"
import type { ParticipantData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkParticipants(
	permitId: string,
): DbState<ParticipantData[]> {
	const [state, dispatch] = useReducer(
		readReducer<ParticipantData[]>,
		makeReadInitial<ParticipantData[]>([]),
	)

	useEffect(() => {
		return subscribeBulkParticipants(permitId, {
			onChange: (participants) =>
				dispatch({ type: "success", data: participants }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}

export function useReadSingleParticipant(
	participantId?: string,
	permitId?: string,
): DbState<ParticipantData | null> {
	const [state, dispatch] = useReducer(
		readReducer<ParticipantData | null>,
		makeReadInitial<ParticipantData | null>(null),
	)

	useEffect(() => {
		if (!participantId || participantId === "new" || !permitId) {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleParticipant(participantId, permitId, {
			onChange: (participant) =>
				dispatch({ type: "success", data: participant }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [participantId, permitId])

	return state
}
