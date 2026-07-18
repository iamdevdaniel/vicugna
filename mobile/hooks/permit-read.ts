import type { BasicInfoModel } from "../database/models"
import type { BasicInfoData } from "@definitions/types"
import { useEffect, useReducer } from "react"
import { mapToBasicInfo } from "../database/mappers"
import { database } from "../database/setup"
import { type DbState } from "./utils"
import { makeReadInitial, readReducer } from "./utils"

export function useReadLocalPermits(): DbState<BasicInfoData[]> {
	const [state, dispatch] = useReducer(
		readReducer<BasicInfoData[]>,
		makeReadInitial<BasicInfoData[]>([]),
	)

	useEffect(() => {
		const subscription = database
			.get<BasicInfoModel>("basicInfo")
			.query()
			.observe()
			.subscribe({
				next: (records) => {
					dispatch({
						type: "success",
						data: records.map((record) => mapToBasicInfo(record)),
					})
				},
				error: (error) => dispatch({ type: "error", error }),
			})

		return () => subscription.unsubscribe()
	}, [])

	return state
}
