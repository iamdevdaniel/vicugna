import { subscribeSingleBasicInfo, type DbState } from "@database"
import type { BasicInfo } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { makeReadInitial, readReducer } from "./utils"

export function useReadSingleBasicInfo(
	permitId: string,
): DbState<BasicInfo | null> {
	const [state, dispatch] = useReducer(
		readReducer<BasicInfo | null>,
		makeReadInitial<BasicInfo | null>(null),
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
