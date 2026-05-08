import type {
	Form11Dehearing,
	Form11Record,
	Form11Shearing,
	Form11Storage,
} from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import type {
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
} from "./models"
import { database } from "./setup"

// CREATE full form11 (storage + shearing + dehearing)
export async function createForm11(
	shearingData: Form11Shearing,
	dehearingData: Form11Dehearing,
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

		await database
			.get<Form11StorageModel>("form11_storage")
			.create((model: Form11StorageModel) => {
				model.shearingId = shearing.id
				model.dehearingId = dehearing.id
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
export async function readForm11(
	form11StorageId: string,
): Promise<Form11Storage> {
	const storage = await database
		.get<Form11StorageModel>("form11_storage")
		.find(form11StorageId)

	const [shearing, dehearing] = await Promise.all([
		database
			.get<Form11ShearingModel>("form11_shearing")
			.find(storage.shearingId),
		database
			.get<Form11DehearingModel>("form11_dehearing")
			.find(storage.dehearingId),
	])

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
		dehearing: {
			id: dehearing.id,
			fechaInicioPredescerdado: dehearing.fechaInicioPredescerdado,
			fechaFinPredescerdado: dehearing.fechaFinPredescerdado,
			lugarPredescerdado: dehearing.lugarPredescerdado,
			responsablesPredescerdado: dehearing.responsablesPredescerdado,
		},
		records: [],
	}
}

// READ ALL records for a specific form11_storage
export async function readForm11Records(
	form11StorageId: string,
): Promise<Form11Record[]> {
	const records = await database
		.get<Form11RecordModel>("form11_record")
		.query(Q.where("form11StorageId", form11StorageId))
		.fetch()

	return records.map((r) => ({
		id: r.id,
		ficha: r.ficha,
		pesoFibraBruto: r.pesoFibraBruto,
		pesoVellonLimpio: r.pesoVellonLimpio,
		pesoBraga: r.pesoBraga,
		pesoTotalFibra: r.pesoTotalFibra,
		pesoFibraPredescerdada: r.pesoFibraPredescerdada,
		pesoCerda: r.pesoCerda,
		caspa: r.caspa,
		nombrePredescerdador: r.nombrePredescerdador,
	}))
}

// READ ALL form11 summaries
export async function readAllForm11(): Promise<Form11Storage[]> {
	const storageRecords = await database
		.get<Form11StorageModel>("form11_storage")
		.query()
		.fetch()

	return Promise.all(
		storageRecords.map(async (storage) => {
			const [shearing, dehearing] = await Promise.all([
				database
					.get<Form11ShearingModel>("form11_shearing")
					.find(storage.shearingId),
				database
					.get<Form11DehearingModel>("form11_dehearing")
					.find(storage.dehearingId),
			])

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
				dehearing: {
					id: dehearing.id,
					fechaInicioPredescerdado:
						dehearing.fechaInicioPredescerdado,
					fechaFinPredescerdado: dehearing.fechaFinPredescerdado,
					lugarPredescerdado: dehearing.lugarPredescerdado,
					responsablesPredescerdado:
						dehearing.responsablesPredescerdado,
				},
				records: [],
			}
		}),
	)
}
