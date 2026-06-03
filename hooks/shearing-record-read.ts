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

type DbAction<T> =
	| { type: "success"; data: T }
	| { type: "error"; error: Error }

function makeInitial<T>(data: T): DbState<T> {
	return { data, loading: true, error: null }
}

function reducer<T>(state: DbState<T>, action: DbAction<T>): DbState<T> {
	switch (action.type) {
		case "success":
			return { data: action.data, loading: false, error: null }
		case "error":
			return { ...state, loading: false, error: action.error }
	}
}

export function useBulkShearingRecords(
	permitId: string,
): DbState<ShearingRecord[]> {
	const [state, dispatch] = useReducer(
		reducer<ShearingRecord[]>,
		makeInitial<ShearingRecord[]>([]),
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

export function useSingleShearingRecordFormData(
	recordId?: string,
): DbState<ShearingRecordFormData | null> {
	const [state, dispatch] = useReducer(
		reducer<ShearingRecordFormData | null>,
		makeInitial<ShearingRecordFormData | null>(null),
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
