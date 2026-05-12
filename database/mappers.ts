import type {
	Form11Dehearing,
	Form11Record,
	Form11Shearing,
	Form11Storage,
} from "@definitions/types"
import type {
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
} from "./models"

export function mapToForm11Storage(
	storage: Form11StorageModel,
	shearing: Form11ShearingModel,
	dehearing: Form11DehearingModel,
): Form11Storage {
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
			isCompleted: shearing.isCompleted,
		},
		dehearing: {
			id: dehearing.id,
			fechaInicioPredescerdado: dehearing.fechaInicioPredescerdado,
			fechaFinPredescerdado: dehearing.fechaFinPredescerdado,
			lugarPredescerdado: dehearing.lugarPredescerdado,
			responsablesPredescerdado: dehearing.responsablesPredescerdado,
			isCompleted: dehearing.isCompleted,
		},
		records: [],
	}
}

export function mapToForm11Record(r: Form11RecordModel): Form11Record {
	return {
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
	}
}

export function applyShearingToModel(
	model: Form11ShearingModel,
	data: Form11Shearing,
): void {
	model.departamento = data.departamento
	model.asociacionRegional = data.asociacionRegional
	model.comunidadManejadora = data.comunidadManejadora
	model.sitioCaptura = data.sitioCaptura
	model.fechaCaptura = data.fechaCaptura
	model.codigoAutorizacion = data.codigoAutorizacion
	model.isCompleted = data.isCompleted
}

export function applyDehearingToModel(
	model: Form11DehearingModel,
	data: Form11Dehearing,
): void {
	model.fechaInicioPredescerdado = data.fechaInicioPredescerdado
	model.fechaFinPredescerdado = data.fechaFinPredescerdado
	model.lugarPredescerdado = data.lugarPredescerdado
	model.responsablesPredescerdado = data.responsablesPredescerdado
	model.isCompleted = data.isCompleted
}
