import { subscribePermits, subscribeSinglePermit } from "@database"
import type { PermitData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadPermits(): DbState<PermitData[]> {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [state, dispatch] = useReducer(
		readReducer<PermitData[]>,
		makeReadInitial<PermitData[]>([]),
	)

	useEffect(() => {
		if (!accountId) {
			dispatch({ type: "success", data: [] })
			return
		}

		return subscribePermits(accountId, {
			onChange: (permits) => dispatch({ type: "success", data: permits }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [accountId])

	return state
}

export function useReadSinglePermit(
	permitId?: string,
): DbState<PermitData | null> {
	const accountId = useMobileAuthStore((state) => state.localDataUserId)
	const [state, dispatch] = useReducer(
		readReducer<PermitData | null>,
		makeReadInitial<PermitData | null>(null),
	)

	useEffect(() => {
		if (!permitId || !accountId) {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSinglePermit(permitId, accountId, {
			onChange: (permit) => dispatch({ type: "success", data: permit }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [accountId, permitId])

	return state
}
