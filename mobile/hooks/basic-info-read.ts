import { subscribeSingleBasicInfo } from "@database"
import type { BasicInfoData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { type DbState } from './utils'
import { makeReadInitial, readReducer } from "./utils"

export function useReadSingleBasicInfo(
	permitId: string,
): DbState<BasicInfoData | null> {
	const [state, dispatch] = useReducer(
		readReducer<BasicInfoData | null>,
		makeReadInitial<BasicInfoData | null>(null),
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
