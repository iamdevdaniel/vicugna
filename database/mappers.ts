import type {
	BasicInfo,
	BasicInfoFormData,
	Form11DehearingFormData,
	Form11Record,
	Form11RecordFormData,
	Form11ShearingFormData,
	Form11Storage,
} from "@definitions/types"
import type {
	BasicInfoModel,
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
} from "./models"

export function mapToForm11Storage(
	storage: Form11StorageModel,
	shearing: Form11ShearingModel,
	dehearing: Form11DehearingModel,
	recordCount: number,
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
		recordCount,
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
	data: Form11ShearingFormData,
	isCompleted: boolean,
): void {
	model.departamento = data.departamento
	model.asociacionRegional = data.asociacionRegional
	model.comunidadManejadora = data.comunidadManejadora
	model.sitioCaptura = data.sitioCaptura
	model.fechaCaptura = data.fechaCaptura
	model.codigoAutorizacion = data.codigoAutorizacion
	model.isCompleted = isCompleted
}

export function applyDehearingToModel(
	model: Form11DehearingModel,
	data: Form11DehearingFormData,
	isCompleted: boolean,
): void {
	model.fechaInicioPredescerdado = data.fechaInicioPredescerdado
	model.fechaFinPredescerdado = data.fechaFinPredescerdado
	model.lugarPredescerdado = data.lugarPredescerdado
	model.responsablesPredescerdado = data.responsablesPredescerdado
	model.isCompleted = isCompleted
}

export function applyRecordToModel(
	model: Form11RecordModel,
	data: Form11RecordFormData,
	storageId?: string,
): void {
	if (storageId) model.form11StorageId = storageId
	model.ficha = data.ficha
	model.pesoFibraBruto = data.pesoFibraBruto
	model.pesoVellonLimpio = data.pesoVellonLimpio
	model.pesoBraga = data.pesoBraga
	model.pesoTotalFibra = data.pesoTotalFibra
	model.pesoFibraPredescerdada = data.pesoFibraPredescerdada
	model.pesoCerda = data.pesoCerda
	model.caspa = data.caspa
	model.nombrePredescerdador = data.nombrePredescerdador
}

export function mapToBasicInfo(m: BasicInfoModel): BasicInfo {
	return {
		id: m.id,
		permitId: m.permitId,
		departamento: m.departamento,
		asociacionRegional: m.asociacionRegional,
		comunidadManejadora: m.comunidadManejadora,
		sitioCaptura: m.sitioCaptura,
		fechaCaptura: m.fechaCaptura,
		isCompleted: m.isCompleted,
	}
}

export function applyBasicInfoToModel(
	model: BasicInfoModel,
	data: BasicInfoFormData,
	isCompleted: boolean,
): void {
	model.departamento = data.departamento
	model.asociacionRegional = data.asociacionRegional
	model.comunidadManejadora = data.comunidadManejadora
	model.sitioCaptura = data.sitioCaptura
	model.fechaCaptura = data.fechaCaptura
	model.isCompleted = isCompleted
}
