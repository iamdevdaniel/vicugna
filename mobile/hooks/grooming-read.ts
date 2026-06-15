import { subscribeBulkGrooming, subscribeSingleGrooming } from "@database"
import type { Grooming } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkGrooming(
	cleaningCommonIds: string[],
): DbState<Grooming[]> {
	const [state, dispatch] = useReducer(
		readReducer<Grooming[]>,
		makeReadInitial<Grooming[]>([]),
	)
	const cleaningCommonIdsKey = cleaningCommonIds.join("|")

	useEffect(() => {
		return subscribeBulkGrooming(cleaningCommonIds, {
			onChange: (records) => dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [cleaningCommonIdsKey])

	return state
}

export function useReadSingleGrooming(
	cleaningCommonId?: string,
): DbState<Grooming | null> {
	const [state, dispatch] = useReducer(
		readReducer<Grooming | null>,
		makeReadInitial<Grooming | null>(null),
	)

	useEffect(() => {
		if (!cleaningCommonId || cleaningCommonId === "new") {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleGrooming(cleaningCommonId, {
			onChange: (record) => dispatch({ type: "success", data: record }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [cleaningCommonId])

	return state
}
