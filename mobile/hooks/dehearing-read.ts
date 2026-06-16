import { subscribeBulkDehearing, subscribeSingleDehearing } from "@database"
import type { Dehearing } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkDehearing(
	cleaningCommonIds: string[],
): DbState<Dehearing[]> {
	const [state, dispatch] = useReducer(
		readReducer<Dehearing[]>,
		makeReadInitial<Dehearing[]>([]),
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
