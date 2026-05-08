import type {
	Form11Dehearing,
	Form11Shearing,
	Form11Storage,
} from "@definitions/types"
import type {
	Form11DehearingModel,
	Form11ShearingModel,
	Form11StorageModel,
} from "./models"
import { database } from "./setup"

// CREATE form11_shearing
export async function createShearingForm(
	shearingData: Form11Shearing,
): Promise<void> {
	await database.write(async () => {
		const shearing = await database
			.get<Form11ShearingModel>("form11_shearing")
			.create((model: Form11ShearingModel) => {
				model.departamento = shearingData.departamento
				model.asociacionRegional = shearingData.asociacionRegional
				model.comunidadManejadora = shearingData.comunidadManejadora
				model.sitioCaptura = shearingData.sitioCaptura
				model.fechaCaptura = shearingData.fechaCaptura
				model.codigoAutorizacion = shearingData.codigoAutorizacion
			})

		await database
			.get<Form11StorageModel>("form11_storage")
			.create((model: Form11StorageModel) => {
				model.shearingId = shearing.id
				model.dehearingId = ""
			})
	})
}

// UPDATE form11_shearing
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
		shearing.update((model: Form11ShearingModel) => {
			model.departamento = shearingData.departamento
			model.asociacionRegional = shearingData.asociacionRegional
			model.comunidadManejadora = shearingData.comunidadManejadora
			model.sitioCaptura = shearingData.sitioCaptura
			model.fechaCaptura = shearingData.fechaCaptura
			model.codigoAutorizacion = shearingData.codigoAutorizacion
		})
	})
}

// CREATE form11_dehearing
export async function createDehearingForm(
	form11StorageId: string,
	dehearingData: Form11Dehearing,
): Promise<void> {
	await database.write(async () => {
		const dehearing = await database
			.get<Form11DehearingModel>("form11_dehearing")
			.create((model: Form11DehearingModel) => {
				model.fechaInicioPredescerdado =
					dehearingData.fechaInicioPredescerdado
				model.fechaFinPredescerdado =
					dehearingData.fechaFinPredescerdado
				model.lugarPredescerdado = dehearingData.lugarPredescerdado
				model.responsablesPredescerdado =
					dehearingData.responsablesPredescerdado
			})
		const storage = await database
			.get<Form11StorageModel>("form11_storage")
			.find(form11StorageId)
		storage.update((model: Form11StorageModel) => {
			model.dehearingId = dehearing.id
		})
	})
}

// READ form11_dehearing BY ID
export async function readDehearingForm(
	form11StorageId: string,
): Promise<Form11Dehearing> {
	const storage = await database
		.get<Form11StorageModel>("form11_storage")
		.find(form11StorageId)
	if (!storage.dehearingId) return {} as Form11Dehearing
	const dehearing = await database
		.get<Form11DehearingModel>("form11_dehearing")
		.find(storage.dehearingId)
	return {
		id: dehearing.id,
		fechaInicioPredescerdado: dehearing.fechaInicioPredescerdado,
		fechaFinPredescerdado: dehearing.fechaFinPredescerdado,
		lugarPredescerdado: dehearing.lugarPredescerdado,
		responsablesPredescerdado: dehearing.responsablesPredescerdado,
	}
}

// UPDATE form11_dehearing
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
		dehearing.update((model: Form11DehearingModel) => {
			model.fechaInicioPredescerdado =
				dehearingData.fechaInicioPredescerdado
			model.fechaFinPredescerdado = dehearingData.fechaFinPredescerdado
			model.lugarPredescerdado = dehearingData.lugarPredescerdado
			model.responsablesPredescerdado =
				dehearingData.responsablesPredescerdado
		})
	})
}

// READ form11 BY ID
export async function readShearingForm(
	form11StorageId: string,
): Promise<Form11Storage> {
	const storage = await database
		.get<Form11StorageModel>("form11_storage")
		.find(form11StorageId)
	const shearing = await database
		.get<Form11ShearingModel>("form11_shearing")
		.find(storage.shearingId)

	return {
		id: storage.id,
		shearing: {
			id: shearing.id,
			departamento: shearing.departamento,
			asociacionRegional: shearing.asociacionRegional,
			comunidadManejadora: shearing.comunidadManejadora,
			sitioCaptura: shearing.sitioCaptura,
			fechaCaptura: shearing.fechaCaptura,
			codigoAutorizacion: shearing.codigoAutorizacion,
		},
		dehearing: {} as Form11Dehearing,
		records: [],
	}
}

// READ form11_shearing IN BULK
export async function readAllShearingForms(): Promise<Form11Storage[]> {
	const storages = await database
		.get<Form11StorageModel>("form11_storage")
		.query()
		.fetch()
	return Promise.all(storages.map((storage) => readShearingForm(storage.id)))
}
