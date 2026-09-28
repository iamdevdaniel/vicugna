import type { PermitData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import {
	ensureFeasibilityPermit,
	FEASIBILITY_ACCOUNT_ID,
	subscribePermits,
	subscribeSinglePermit,
} from "../database/index.web"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadPermits(): DbState<PermitData[]> {
	const [state, dispatch] = useReducer(
		readReducer<PermitData[]>,
		makeReadInitial<PermitData[]>([]),
	)

	useEffect(() => {
		let active = true
		let unsubscribe: (() => void) | undefined

		void ensureFeasibilityPermit()
			.then(() => {
				if (!active) return
				unsubscribe = subscribePermits(FEASIBILITY_ACCOUNT_ID, {
					onChange: (permits) =>
						dispatch({ type: "success", data: permits }),
					onError: (error) => dispatch({ type: "error", error }),
				})
			})
			.catch((error: Error) => {
				if (active) dispatch({ type: "error", error })
			})

		return () => {
			active = false
			unsubscribe?.()
		}
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

		let active = true
		let unsubscribe: (() => void) | undefined

		void ensureFeasibilityPermit()
			.then(() => {
				if (!active) return
				unsubscribe = subscribeSinglePermit(
					FEASIBILITY_ACCOUNT_ID,
					permitId,
					{
						onChange: (permit) =>
							dispatch({ type: "success", data: permit }),
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
