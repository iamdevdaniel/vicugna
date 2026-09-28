import type { ParticipantData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import { useEffect, useReducer } from "react"
import { subscribeBulkParticipants } from "../database/index.web"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkParticipants(
	permitId: string,
): DbState<ParticipantData[]> {
	const accountId = useMobileAuthStore((state) => state.user?.id)
	const [state, dispatch] = useReducer(
		readReducer<ParticipantData[]>,
		makeReadInitial<ParticipantData[]>([]),
	)

	useEffect(() => {
		if (!accountId) {
			dispatch({ type: "success", data: [] })
			return
		}

		let active = true
		const unsubscribe = subscribeBulkParticipants(accountId, permitId, {
			onChange: (participants) => {
				if (active) dispatch({ type: "success", data: participants })
			},
			onError: (error) => {
				if (active) dispatch({ type: "error", error })
			},
		})

		return () => {
			active = false
			unsubscribe()
		}
	}, [accountId, permitId])

	return state
}
