import type { BasicInfo, BasicInfoFormData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { useEffect, useReducer } from "react"
import { applyBasicInfoToModel, mapToBasicInfo } from "./mappers"
import type { BasicInfoModel } from "./models"
import { database } from "./setup"
import { type DbState, makeInitial, makeReducer } from "./utils-db"

let initializingPermits = false

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
			.observe()
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
				model.departamento = ""
				model.asociacionRegional = ""
				model.comunidadManejadora = ""
				model.sitioCaptura = ""
				model.fechaCaptura = ""
			})
	})
	if (!record) throw new Error("No se pudo crear el registro de info básica.")
	return mapToBasicInfo(record)
}

export async function initializePermits(permitIds: string[]): Promise<void> {
	if (initializingPermits) return
	initializingPermits = true
	try {
		const existing = await database
			.get<BasicInfoModel>("basicInfo")
			.query(Q.where("permitId", Q.oneOf(permitIds)))
			.fetch()
		const existingIds = new Set(existing.map((r) => r.permitId))
		const missing = permitIds.filter((id) => !existingIds.has(id))
		if (missing.length === 0) return
		await database.write(async () => {
			await database.batch(
				...missing.map((permitId) =>
					database
						.get<BasicInfoModel>("basicInfo")
						.prepareCreate((model) => {
							model.permitId = permitId
							model.departamento = ""
							model.asociacionRegional = ""
							model.comunidadManejadora = ""
							model.sitioCaptura = ""
							model.fechaCaptura = ""
						}),
				),
			)
		})
	} finally {
		initializingPermits = false
	}
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
