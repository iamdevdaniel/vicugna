import { subscribeBulkCleaningRecords } from "@database"
import type { CleaningRecord } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkCleaningRecords(
	permitId: string,
): DbState<CleaningRecord[]> {
	const [state, dispatch] = useReducer(
		readReducer<CleaningRecord[]>,
		makeReadInitial<CleaningRecord[]>([]),
	)

	useEffect(() => {
		return subscribeBulkCleaningRecords(permitId, {
			onChange: (records) =>
				dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}
