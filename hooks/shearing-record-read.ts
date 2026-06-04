import {
	subscribeBulkShearingRecords,
	subscribeSingleShearingRecordFormData,
	type DbState,
} from "@database"
import type {
	ShearingRecord,
	ShearingRecordFormData,
} from "@definitions/types"
import { useEffect, useReducer } from "react"
import { makeReadInitial, readReducer } from "./utils"

export function useReadBulkShearingRecords(
	permitId: string,
): DbState<ShearingRecord[]> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingRecord[]>,
		makeReadInitial<ShearingRecord[]>([]),
	)

	useEffect(() => {
		return subscribeBulkShearingRecords(permitId, {
			onChange: (records) =>
				dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}

export function useReadSingleShearingRecordFormData(
	recordId?: string,
): DbState<ShearingRecordFormData | null> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingRecordFormData | null>,
		makeReadInitial<ShearingRecordFormData | null>(null),
	)

	useEffect(() => {
		if (!recordId) {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleShearingRecordFormData(recordId, {
			onChange: (data) => dispatch({ type: "success", data }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [recordId])

	return state
}
