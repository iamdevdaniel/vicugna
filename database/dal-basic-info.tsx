import type { BasicInfo, BasicInfoFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { useEffect, useReducer } from "react"
import { applyBasicInfoToModel, mapToBasicInfo } from "./mappers"
import type { BasicInfoModel } from "./models"
import { database } from "./setup"
import { type DbState, makeInitial, makeReducer } from "./utils-db"

//-------------------READ-------------------

export function useReadBasicInfo(permitId: string): DbState<BasicInfo | null> {
	const [state, dispatch] = useReducer(
		makeReducer<BasicInfo | null>(),
		makeInitial<BasicInfo | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<BasicInfoModel>("basicInfo")
			.query(Q.where("permitId", permitId))
			.observeWithColumns([
				"department",
				"regional",
				"community",
				"site",
				"date",
				"isCompleted",
			])
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records[0] ? mapToBasicInfo(records[0]) : null,
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [permitId])

	return state
}

//-------------------WRITE-------------------

export async function createBasicInfo(permitId: string): Promise<BasicInfo> {
	let record: BasicInfoModel | undefined
	await database.write(async () => {
		record = await database
			.get<BasicInfoModel>("basicInfo")
			.create((model) => {
				model.permitId = permitId
				model.department = ""
				model.regional = ""
				model.community = ""
				model.site = ""
				model.date = ""
			})
	})
	if (!record) throw new Error("No se pudo crear el registro de info básica.")
	return mapToBasicInfo(record)
}

export async function updateBasicInfo(
	id: string,
	data: BasicInfoFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database.get<BasicInfoModel>("basicInfo").find(id)
		await record.update((model) => applyBasicInfoToModel(model, data, true))
	})
}
