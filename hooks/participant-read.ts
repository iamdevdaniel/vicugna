import {
	subscribeBulkParticipants,
	subscribeSingleParticipant,
	type DbState,
} from "@database"
import type { Participant } from "@definitions/types"
import { useEffect, useReducer } from "react"

type DbAction<T> =
	| { type: "success"; data: T }
	| { type: "error"; error: Error }

function makeInitial<T>(data: T): DbState<T> {
	return { data, loading: true, error: null }
}

function reducer<T>(state: DbState<T>, action: DbAction<T>): DbState<T> {
	switch (action.type) {
		case "success":
			return { data: action.data, loading: false, error: null }
		case "error":
			return { ...state, loading: false, error: action.error }
	}
}

export function useReadBulkParticipants(
	permitId: string,
): DbState<Participant[]> {
	const [state, dispatch] = useReducer(
		reducer<Participant[]>,
		makeInitial<Participant[]>([]),
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
		reducer<Participant | null>,
		makeInitial<Participant | null>(null),
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
