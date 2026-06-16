import { subscribeSingleCleaningHeader } from "@database"
import type { CleaningHeader } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadSingleCleaningHeader(
	permitId: string,
): DbState<CleaningHeader | null> {
	const [state, dispatch] = useReducer(
		readReducer<CleaningHeader | null>,
		makeReadInitial<CleaningHeader | null>(null),
	)

	useEffect(() => {
		return subscribeSingleCleaningHeader(permitId, {
			onChange: (header) =>
				dispatch({ type: "success", data: header }),
			onError: (error) => dispatch({ type: "error", error }),
		})
	}, [permitId])

	return state
}
