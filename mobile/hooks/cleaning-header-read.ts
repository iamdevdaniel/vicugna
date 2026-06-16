import { subscribeSingleCleaningHeader } from "@database"
import type { CleaningHeaderData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

export function useReadSingleCleaningHeader(
	permitId: string,
): DbState<CleaningHeaderData | null> {
	const [state, dispatch] = useReducer(
		readReducer<CleaningHeaderData | null>,
		makeReadInitial<CleaningHeaderData | null>(null),
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
