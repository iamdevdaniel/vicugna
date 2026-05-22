import type {
	Form11DehearingFormData,
	Form11Record,
	Form11RecordFormData,
	Form11ShearingFormData,
	Form11Storage,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import { DB_ERRORS } from "@utils/constants"
import { useEffect, useReducer } from "react"
import { combineLatest, map, of, switchMap } from "rxjs"
import {
	applyDehearingToModel,
	applyRecordToModel,
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
import { type DbState, makeInitial, makeReducer } from "./utils-db"

//-------------------READ-------------------

export function useReadAllForm11(): DbState<Form11Storage[]> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Storage[]>(),
		makeInitial<Form11Storage[]>([]),
	)

	useEffect(() => {
		const sub = database
			.get<Form11StorageModel>("form11Storage")
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
										database
											.get<Form11RecordModel>(
												"form11Record",
											)
											.query(
												Q.where(
													"form11StorageId",
													storage.id,
												),
											)
											.observeCount(),
									]).pipe(
										map(
											([
												shearing,
												dehearing,
												recordCount,
											]) =>
												mapToForm11Storage(
													storage,
													shearing,
													dehearing,
													recordCount,
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

export function useReadOneForm11(id: string): DbState<Form11Storage | null> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Storage | null>(),
		makeInitial<Form11Storage | null>(null),
	)

	useEffect(() => {
		const sub = database
			.get<Form11StorageModel>("form11Storage")
			.findAndObserve(id)
			.pipe(
				switchMap((storage) =>
					combineLatest([
						storage.shearing.observe(),
						storage.dehearing.observe(),
						database
							.get<Form11RecordModel>("form11Record")
							.query(Q.where("form11StorageId", storage.id))
							.observeCount(),
					]).pipe(
						map(([shearing, dehearing, recordCount]) =>
							mapToForm11Storage(
								storage,
								shearing,
								dehearing,
								recordCount,
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
	}, [id])

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
			.get<Form11RecordModel>("form11Record")
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

//-------------------WRITE-------------------

export async function createForm11(): Promise<Form11Storage> {
	let storage: Form11StorageModel | undefined
	await database.write(async () => {
		const shearing = await database
			.get<Form11ShearingModel>("form11Shearing")
			.create((model: Form11ShearingModel) => {
				model.departamento = ""
				model.asociacionRegional = ""
				model.comunidadManejadora = ""
				model.sitioCaptura = ""
				model.fechaCaptura = ""
				model.codigoAutorizacion = ""
			})

		const dehearing = await database
			.get<Form11DehearingModel>("form11Dehearing")
			.create((model: Form11DehearingModel) => {
				model.fechaInicioPredescerdado = ""
				model.fechaFinPredescerdado = ""
				model.lugarPredescerdado = ""
				model.responsablesPredescerdado = ""
			})

		storage = await database
			.get<Form11StorageModel>("form11Storage")
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
	return mapToForm11Storage(s, shearing, dehearing, 0)
}

export async function updateShearingForm(
	form11StorageId: string,
	shearingData: Form11ShearingFormData,
	isCompleted: boolean,
): Promise<void> {
	await database.write(async () => {
		const storage = await database
			.get<Form11StorageModel>("form11Storage")
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
			.get<Form11StorageModel>("form11Storage")
			.find(form11StorageId)
		if (!storage.dehearing.id) return
		const dehearing = await storage.dehearing.fetch()
		await dehearing.update((model) =>
			applyDehearingToModel(model, dehearingData, isCompleted),
		)
	})
}

export function useReadOneForm11Record(
	recordId: string | null,
): DbState<Form11Record | null> {
	const [state, dispatch] = useReducer(
		makeReducer<Form11Record | null>(),
		makeInitial<Form11Record | null>(null),
	)

	useEffect(() => {
		if (!recordId) {
			dispatch({ type: "success", data: null })
			return
		}
		const sub = database
			.get<Form11RecordModel>("form11Record")
			.findAndObserve(recordId)
			.subscribe({
				next: (record) =>
					dispatch({
						type: "success",
						data: mapToForm11Record(record),
					}),
				error: (e) => dispatch({ type: "error", error: e as Error }),
			})
		return () => sub.unsubscribe()
	}, [recordId])

	return state
}

export async function createForm11Record(
	storageId: string,
	data: Form11RecordFormData,
): Promise<void> {
	await database.write(async () => {
		await database
			.get<Form11RecordModel>("form11Record")
			.create((model) => applyRecordToModel(model, data, storageId))
	})
}

export async function updateForm11Record(
	recordId: string,
	data: Form11RecordFormData,
): Promise<void> {
	await database.write(async () => {
		const record = await database
			.get<Form11RecordModel>("form11Record")
			.find(recordId)
		await record.update((model) => applyRecordToModel(model, data))
	})
}
