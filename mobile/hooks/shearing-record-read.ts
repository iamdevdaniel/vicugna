import {
	subscribeBulkShearingRecords,
	subscribeSingleShearingRecordFormData,
} from "@database"
import type {
	ShearingRecordData,
	ShearingRecordFormData,
} from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadBulkShearingRecords(
	permitId: string,
): DbState<ShearingRecordData[]> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingRecordData[]>,
		makeReadInitial<ShearingRecordData[]>([]),
	)

	useEffect(() => {
		return subscribeBulkShearingRecords(permitId, {
			onChange: (records) => dispatch({ type: "success", data: records }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}

export function useReadSingleShearingRecordFormData(
	recordId?: string,
	permitId?: string,
): DbState<ShearingRecordFormData | null> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingRecordFormData | null>,
		makeReadInitial<ShearingRecordFormData | null>(null),
	)

	useEffect(() => {
		if (!recordId || !permitId) {
			dispatch({ type: "success", data: null })
			return
		}

		return subscribeSingleShearingRecordFormData(recordId, permitId, {
			onChange: (data) => dispatch({ type: "success", data }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [recordId, permitId])

	return state
}
