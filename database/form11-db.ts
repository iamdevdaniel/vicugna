import type {
	Form11DehearingFormData,
	Form11Record,
	Form11ShearingFormData,
	Form11Storage,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { DB_ERRORS } from "@utils/constants"
import { useEffect, useReducer } from "react"
import { combineLatest, map, of, switchMap } from "rxjs"
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

type DbState<T> = { data: T; loading: boolean; error: Error | null }
type DbAction<T> =
	| { type: "success"; data: T }
	| { type: "error"; error: Error }

function makeReducer<T>() {
	return (state: DbState<T>, action: DbAction<T>): DbState<T> => {
		switch (action.type) {
			case "success":
				return { data: action.data, loading: false, error: null }
			case "error":
				return { ...state, loading: false, error: action.error }
		}
	}
}

function makeInitial<T>(initial: T): DbState<T> {
	return { data: initial, loading: true, error: null }
}

export function useReadAllForm11(): DbState<Form11Storage[]> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Storage[]>(),
		makeInitial<Form11Storage[]>([]),
	)

	useEffect(() => {
		const sub = database
			.get<Form11StorageModel>("form11_storage")
			.query()
			.observe()
			.pipe(
				switchMap((storages) =>
					storages.length === 0
						? of([])
						: combineLatest(
								storages.map((storage) =>
									combineLatest([
										storage.shearing.observe(),
										storage.dehearing.observe(),
									]).pipe(
										map(([shearing, dehearing]) =>
											mapToForm11Storage(
												storage,
												shearing,
												dehearing,
											),
										),
									),
								),
							),
				),
			)
			.subscribe({
				next: (data) => dispatch({ type: "success", data }),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [])

	return state
}

export function useReadForm11Records(
	storageId: string,
): DbState<Form11Record[]> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Record[]>(),
		makeInitial<Form11Record[]>([]),
	)

	useEffect(() => {
		const sub = database
			.get<Form11RecordModel>("form11_record")
			.query(Q.where("form11StorageId", storageId))
			.observe()
			.subscribe({
				next: (records) =>
					dispatch({
						type: "success",
						data: records.map(mapToForm11Record),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [storageId])

	return state
}

export function useReadOneForm11(id: string): DbState<Form11Storage | null> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Storage | null>(),
		makeInitial<Form11Storage | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<Form11StorageModel>("form11_storage")
			.findAndObserve(id)
			.pipe(
				switchMap((storage) =>
					combineLatest([
						storage.shearing.observe(),
						storage.dehearing.observe(),
					]).pipe(
						map(([shearing, dehearing]) =>
							mapToForm11Storage(storage, shearing, dehearing),
						),
					),
				),
			)
			.subscribe({
				next: (data) => dispatch({ type: "success", data }),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [id])

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
				model.shearing.set(shearing)
				model.dehearing.set(dehearing)
			})
	})
	if (!storage) throw new Error(DB_ERRORS.FORM11.FAILED_CREATE_STORAGE)
	const s = storage as Form11StorageModel
	const [shearing, dehearing] = await Promise.all([
		s.shearing.fetch(),
		s.dehearing.fetch(),
	])
	return mapToForm11Storage(s, shearing, dehearing)
}

export async function updateShearingForm(
	form11StorageId: string,
	shearingData: Form11ShearingFormData,
	isCompleted: boolean,
): Promise<void> {
	await database.write(async () => {
		const storage = await database
			.get<Form11StorageModel>("form11_storage")
			.find(form11StorageId)

		const shearing = await storage.shearing.fetch()

		await shearing.update((model) =>
			applyShearingToModel(model, shearingData, isCompleted),
		)
	})
}

export async function updateDehearingForm(
	form11StorageId: string,
	dehearingData: Form11DehearingFormData,
	isCompleted: boolean,
): Promise<void> {
	await database.write(async () => {
		const storage = await database
			.get<Form11StorageModel>("form11_storage")
			.find(form11StorageId)
		if (!storage.dehearing.id) return
		const dehearing = await storage.dehearing.fetch()
		await dehearing.update((model) =>
			applyDehearingToModel(model, dehearingData, isCompleted),
		)
	})
}
