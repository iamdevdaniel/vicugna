import {
	subscribeBulkCleaningCommon,
	subscribeSingleCleaningCommon,
} from "@database"
import type { CleaningCommonData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkCleaningCommon(
	permitId: string,
): DbState<CleaningCommonData[]> {
	const [state, dispatch] = useReducer(
		readReducer<CleaningCommonData[]>,
		makeReadInitial<CleaningCommonData[]>([]),
	)

	useEffect(() => {
		return subscribeBulkCleaningCommon(permitId, {
			onChange: (records) =>
				dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}

export function useReadSingleCleaningCommon(
	cleaningCommonId?: string,
): DbState<CleaningCommonData | null> {
	const [state, dispatch] = useReducer(
		readReducer<CleaningCommonData | null>,
		makeReadInitial<CleaningCommonData | null>(null),
	)

	useEffect(() => {
		if (!cleaningCommonId || cleaningCommonId === "new") {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleCleaningCommon(cleaningCommonId, {
			onChange: (record) => dispatch({ type: "success", data: record }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [cleaningCommonId])

	return state
}
