import {
	subscribeBulkParticipants,
	subscribeSingleParticipant
} from "@database"
import { type DbState } from './utils'
import type { Participant } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { makeReadInitial, readReducer } from "./utils"

export function useReadBulkParticipants(
	permitId: string,
): DbState<Participant[]> {
	const [state, dispatch] = useReducer(
		readReducer<Participant[]>,
		makeReadInitial<Participant[]>([]),
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
): DbState<Participant | null> {
	const [state, dispatch] = useReducer(
		readReducer<Participant | null>,
		makeReadInitial<Participant | null>(null),
	)

	useEffect(() => {
		if (!participantId || participantId === "new") {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleParticipant(participantId, {
			onChange: (participant) =>
				dispatch({ type: "success", data: participant }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [participantId])

	return state
}
