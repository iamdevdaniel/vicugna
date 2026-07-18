import { subscribePermits } from "@database"
import type { PermitData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadPermits(): DbState<PermitData[]> {
	const [state, dispatch] = useReducer(
		readReducer<PermitData[]>,
		makeReadInitial<PermitData[]>([]),
	)

	useEffect(() => {
		return subscribePermits({
			onChange: (permits) => dispatch({ type: "success", data: permits }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [])

	return state
}
