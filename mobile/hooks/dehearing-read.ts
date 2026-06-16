import { subscribeBulkDehearing, subscribeSingleDehearing } from "@database"
import type { DehearingData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkDehearing(
	cleaningCommonIds: string[],
): DbState<DehearingData[]> {
	const [state, dispatch] = useReducer(
		readReducer<DehearingData[]>,
		makeReadInitial<DehearingData[]>([]),
	)
	const cleaningCommonIdsKey = cleaningCommonIds.join("|")

	useEffect(() => {
		return subscribeBulkDehearing(cleaningCommonIds, {
			onChange: (records) => dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [cleaningCommonIdsKey])

	return state
}

export function useReadSingleDehearing(
	cleaningCommonId?: string,
): DbState<DehearingData | null> {
	const [state, dispatch] = useReducer(
		readReducer<DehearingData | null>,
		makeReadInitial<DehearingData | null>(null),
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
