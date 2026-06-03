import { subscribeSingleShearingHeader, type DbState } from "@database"
import type { ShearingHeader } from "@definitions/types"
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

export function useSingleShearingHeader(
	permitId: string,
): DbState<ShearingHeader | null> {
	const [state, dispatch] = useReducer(
		reducer<ShearingHeader | null>,
		makeInitial<ShearingHeader | null>(null),
	)

	useEffect(() => {
		return subscribeSingleShearingHeader(permitId, {
			onChange: (header) =>
				dispatch({ type: "success", data: header }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}
