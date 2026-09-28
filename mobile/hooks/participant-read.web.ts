import type { ParticipantData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import {
	ensureFeasibilityPermit,
	FEASIBILITY_ACCOUNT_ID,
	subscribeBulkParticipants,
} from "../database/index.web"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkParticipants(
	permitId: string,
): DbState<ParticipantData[]> {
	const [state, dispatch] = useReducer(
		readReducer<ParticipantData[]>,
		makeReadInitial<ParticipantData[]>([]),
	)

	useEffect(() => {
		let active = true
		let unsubscribe: (() => void) | undefined

		void ensureFeasibilityPermit()
			.then(() => {
				if (!active) return
				unsubscribe = subscribeBulkParticipants(
					FEASIBILITY_ACCOUNT_ID,
					permitId,
					{
						onChange: (participants) =>
							dispatch({ type: "success", data: participants }),
						onError: (error) => dispatch({ type: "error", error }),
					},
				)
			})
			.catch((error: Error) => {
				if (active) dispatch({ type: "error", error })
			})

		return () => {
			active = false
			unsubscribe?.()
		}
	}, [permitId])

	return state
}
