import { subscribeSingleDehearing } from "@database"
import type { Dehearing } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadSingleDehearing(
	cleaningCommonId?: string,
): DbState<Dehearing | null> {
	const [state, dispatch] = useReducer(
		readReducer<Dehearing | null>,
		makeReadInitial<Dehearing | null>(null),
	)

	useEffect(() => {
		if (!cleaningCommonId || cleaningCommonId === "new") {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleDehearing(cleaningCommonId, {
			onChange: (record) => dispatch({ type: "success", data: record }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [cleaningCommonId])

	return state
}
