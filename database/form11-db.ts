import type {
	Form11Dehearing,
	Form11Record,
	Form11Shearing,
	Form11Storage,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { DB_ERRORS } from "@utils/constants"
import { useEffect, useReducer } from "react"
import {
	applyDehearingToModel,
	applyShearingToModel,
	mapToForm11Record,
	mapToForm11Storage,
} from "./mappers"
import type {
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
} from "./models"
import { database } from "./setup"

//-------------------READ-------------------

type StorageState = {
	data: Form11Storage[]
	loading: boolean
	error: Error | null
}

type StorageAction =
	| { type: "success"; data: Form11Storage[] }
	| { type: "error"; error: Error }

function storageReducer(
	state: StorageState,
	action: StorageAction,
): StorageState {
	switch (action.type) {
		case "success":
			return { data: action.data, loading: false, error: null }
		case "error":
			return { ...state, loading: false, error: action.error }
	}
}

export function useReadAllForm11(): StorageState {
	const [state, dispatch] = useReducer(storageReducer, {
		data: [],
		loading: true,
		error: null,
	})

	useEffect(() => {
		const subscription = database
			.get<Form11StorageModel>("form11_storage")
			.query()
			.observe()
			.subscribe(async (storageRecords) => {
				try {
					const mapped = await Promise.all(
						storageRecords.map(async (storage) => {
							const [shearing, dehearing] = await Promise.all([
								database
									.get<Form11ShearingModel>("form11_shearing")
									.find(storage.shearingId),
								database
									.get<Form11DehearingModel>(
										"form11_dehearing",
									)
									.find(storage.dehearingId),
							])
							return mapToForm11Storage(
								storage,
								shearing,
								dehearing,
							)
						}),
					)
					dispatch({ type: "success", data: mapped })
				} catch (e) {
					dispatch({ type: "error", error: e as Error })
				}
			})

		return () => subscription.unsubscribe()
	}, [])

	return state
}

type RecordsState = {
	data: Form11Record[]
	loading: boolean
	error: Error | null
}

type RecordsAction =
	| { type: "success"; data: Form11Record[] }
	| { type: "error"; error: Error }

function recordsReducer(
	state: RecordsState,
	action: RecordsAction,
): RecordsState {
	switch (action.type) {
		case "success":
			return { data: action.data, loading: false, error: null }
		case "error":
			return { ...state, loading: false, error: action.error }
	}
}

export function useReadForm11Records(storageId: string): RecordsState {
	const [state, dispatch] = useReducer(recordsReducer, {
		data: [],
		loading: true,
		error: null,
	})

	useEffect(() => {
		const subscription = database
			.get<Form11RecordModel>("form11_record")
			.query(Q.where("form11StorageId", storageId))
			.observe()
			.subscribe({
				next: (records) => {
					dispatch({
						type: "success",
						data: records.map(mapToForm11Record),
					})
				},
				error: (e) => {
					dispatch({ type: "error", error: e as Error })
				},
			})

		return () => subscription.unsubscribe()
	}, [storageId])

	return state
}

//-------------------WRITE-------------------

export async function createForm11(): Promise<Form11Storage> {
	let storage: Form11StorageModel | undefined
	await database.write(async () => {
		const shearing = await database
			.get<Form11ShearingModel>("form11_shearing")
			.create((model: Form11ShearingModel) => {
				model.departamento = ""
				model.asociacionRegional = ""
				model.comunidadManejadora = ""
				model.sitioCaptura = ""
				model.fechaCaptura = ""
				model.codigoAutorizacion = ""
			})

		const dehearing = await database
			.get<Form11DehearingModel>("form11_dehearing")
			.create((model: Form11DehearingModel) => {
				model.fechaInicioPredescerdado = ""
				model.fechaFinPredescerdado = ""
				model.lugarPredescerdado = ""
				model.responsablesPredescerdado = ""
			})

		storage = await database
			.get<Form11StorageModel>("form11_storage")
			.create((model: Form11StorageModel) => {
				model.shearingId = shearing.id
				model.dehearingId = dehearing.id
			})
	})
	if (!storage) throw new Error(DB_ERRORS.FORM11.FAILED_CREATE_STORAGE)
	const s = storage as Form11StorageModel
	const [shearing, dehearing] = await Promise.all([
		database.get<Form11ShearingModel>("form11_shearing").find(s.shearingId),
		database
			.get<Form11DehearingModel>("form11_dehearing")
			.find(s.dehearingId),
	])
	return mapToForm11Storage(s, shearing, dehearing)
}

export async function updateShearingForm(
	form11StorageId: string,
	shearingData: Form11Shearing,
): Promise<void> {
	await database.write(async () => {
		const storage = await database
			.get<Form11StorageModel>("form11_storage")
			.find(form11StorageId)

		const shearing = await database
			.get<Form11ShearingModel>("form11_shearing")
			.find(storage.shearingId)

		await shearing.update((model) =>
			applyShearingToModel(model, shearingData),
		)
	})
}

export async function updateDehearingForm(
	form11StorageId: string,
	dehearingData: Form11Dehearing,
): Promise<void> {
	await database.write(async () => {
		const storage = await database
			.get<Form11StorageModel>("form11_storage")
			.find(form11StorageId)
		if (!storage.dehearingId) return
		const dehearing = await database
			.get<Form11DehearingModel>("form11_dehearing")
			.find(storage.dehearingId)
		await dehearing.update((model) =>
			applyDehearingToModel(model, dehearingData),
		)
	})
}
