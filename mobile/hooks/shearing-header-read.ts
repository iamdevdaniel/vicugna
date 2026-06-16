import { subscribeSingleShearingHeader } from "@database"
import { type DbState } from './utils'
import type { ShearingHeaderData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { makeReadInitial, readReducer } from "./utils"

export function useReadSingleShearingHeader(
	permitId: string,
): DbState<ShearingHeaderData | null> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingHeaderData | null>,
		makeReadInitial<ShearingHeaderData | null>(null),
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
