import { subscribeSingleBasicInfo, type DbState } from "@database"
import type { BasicInfo } from "@definitions/types"
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

export function useReadSingleBasicInfo(
	permitId: string,
): DbState<BasicInfo | null> {
	const [state, dispatch] = useReducer(
		reducer<BasicInfo | null>,
		makeInitial<BasicInfo | null>(null),
	)

	useEffect(() => {
		return subscribeSingleBasicInfo(permitId, {
			onChange: (basicInfo) =>
				dispatch({ type: "success", data: basicInfo }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}
