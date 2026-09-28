import type { PermitData } from "@definitions/types"
import { useMobileAuthStore } from "@utils/auth-store"
import { useEffect, useReducer } from "react"
import { subscribePermits, subscribeSinglePermit } from "../database/index.web"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadPermits(): DbState<PermitData[]> {
	const accountId = useMobileAuthStore((state) => state.user?.id)
	const [state, dispatch] = useReducer(
		readReducer<PermitData[]>,
		makeReadInitial<PermitData[]>([]),
	)

	useEffect(() => {
		if (!accountId) {
			dispatch({ type: "success", data: [] })
			return
		}

		let active = true
		const unsubscribe = subscribePermits(accountId, {
			onChange: (permits) => {
				if (active) dispatch({ type: "success", data: permits })
			},
			onError: (error) => {
				if (active) dispatch({ type: "error", error })
			},
		})

		return () => {
			active = false
			unsubscribe()
		}
	}, [accountId])

	return state
}

export function useReadSinglePermit(
	permitId?: string,
): DbState<PermitData | null> {
	const accountId = useMobileAuthStore((state) => state.user?.id)
	const [state, dispatch] = useReducer(
		readReducer<PermitData | null>,
		makeReadInitial<PermitData | null>(null),
	)

	useEffect(() => {
		if (!permitId || !accountId) {
			dispatch({ type: "success", data: null })
			return
		}

		let active = true
		const unsubscribe = subscribeSinglePermit(accountId, permitId, {
			onChange: (permit) => {
				if (active) dispatch({ type: "success", data: permit })
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
