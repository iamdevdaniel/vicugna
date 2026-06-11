import { subscribeSingleGrooming } from "@database"
import type { Grooming } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState, makeReadInitial, readReducer } from "./utils"

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
