import { subscribeSingleShearingHeader } from "@database"
import { type DbState } from './utils'
import type { ShearingHeader } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { makeReadInitial, readReducer } from "./utils"

export function useReadSingleShearingHeader(
	permitId: string,
): DbState<ShearingHeader | null> {
	const [state, dispatch] = useReducer(
		readReducer<ShearingHeader | null>,
		makeReadInitial<ShearingHeader | null>(null),
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
