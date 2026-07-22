import { subscribePermits, subscribeSinglePermit } from "@database"
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

export function useReadSinglePermit(
	permitId?: string,
): DbState<PermitData | null> {
	const [state, dispatch] = useReducer(
		readReducer<PermitData | null>,
		makeReadInitial<PermitData | null>(null),
	)

	useEffect(() => {
		if (!permitId) {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSinglePermit(permitId, {
			onChange: (permit) => dispatch({ type: "success", data: permit }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}

export function usePermitReadOnly(permitId?: string) {
	const { data } = useReadSinglePermit(permitId)

	return data?.isSynced === true
}
