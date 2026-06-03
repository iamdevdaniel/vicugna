import type {
	BasicInfo,
	BasicInfoFormData,
	Form11DehearingFormData,
	Form11Record,
	Form11RecordFormData,
	Form11ShearingFormData,
	Form11Storage,
	Participant,
	ParticipantFormData,
	ShearingHeader,
	ShearingHeaderFormData,
	ShearingRecord,
	ShearingRecordFormData,
} from "@definitions/types"
import type {
	BasicInfoModel,
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
	ParticipantModel,
	ShearingHeaderModel,
	ShearingRecordModel,
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
			department: shearing.department,
			regional: shearing.regional,
			community: shearing.community,
			site: shearing.site,
			date: shearing.date,
			codigoAutorizacion: shearing.codigoAutorizacion,
			isCompleted: shearing.isCompleted,
		},
		dehearing: {
			id: dehearing.id,
			startDate: dehearing.startDate,
			endDate: dehearing.endDate,
			site: dehearing.site,
			supervisors: dehearing.supervisors,
			isCompleted: dehearing.isCompleted,
		},
		recordCount,
	}
}

export function mapToForm11Record(r: Form11RecordModel): Form11Record {
	return {
		id: r.id,
		tagId: r.tagId,
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
	model.department = data.department
	model.regional = data.regional
	model.community = data.community
	model.site = data.site
	model.date = data.date
	model.codigoAutorizacion = data.codigoAutorizacion
	model.isCompleted = isCompleted
}

export function applyDehearingToModel(
	model: Form11DehearingModel,
	data: Form11DehearingFormData,
	isCompleted: boolean,
): void {
	model.startDate = data.startDate
	model.endDate = data.endDate
	model.site = data.site
	model.supervisors = data.supervisors
	model.isCompleted = isCompleted
}

export function applyRecordToModel(
	model: Form11RecordModel,
	data: Form11RecordFormData,
	storageId?: string,
): void {
	if (storageId) model.form11StorageId = storageId
	model.tagId = data.tagId
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
		department: m.department,
		regional: m.regional,
		community: m.community,
		site: m.site,
		date: m.date,
		isCompleted: m.isCompleted,
	}
}

export function applyBasicInfoToModel(
	model: BasicInfoModel,
	data: BasicInfoFormData,
	isCompleted: boolean,
): void {
	model.department = data.department
	model.regional = data.regional
	model.community = data.community
	model.site = data.site
	model.date = data.date
	model.isCompleted = isCompleted
}

export function mapToParticipant(m: ParticipantModel): Participant {
	return {
		id: m.id,
		permitId: m.permitId,
		name: m.name,
		lastNames: m.lastNames,
		gender: m.gender,
		identityNumber: m.identityNumber,
		signature: m.signature,
		notes: m.notes,
	}
}

export function applyParticipantToModel(
	model: ParticipantModel,
	data: ParticipantFormData,
): void {
	model.name = data.name
	model.lastNames = data.lastNames
	model.gender = data.gender
	model.identityNumber = data.identityNumber
	model.signature = data.signature
	model.notes = data.notes
}

export function mapToShearingHeader(
	model: ShearingHeaderModel,
): ShearingHeader {
	return {
		id: model.id,
		permitId: model.permitId,
		site: model.site,
		latitude: model.latitude,
		longitude: model.longitude,
		roundupCount: model.roundupCount,
		startTime: model.startTime,
		endTime: model.endTime,
		isCompleted: model.isCompleted,
	}
}

export function applyShearingHeaderToModel(
	model: ShearingHeaderModel,
	data: ShearingHeaderFormData,
	isCompleted: boolean,
) {
	model.site = data.site
	model.latitude = data.latitude
	model.longitude = data.longitude
	model.roundupCount = data.roundupCount
	model.startTime = data.startTime
	model.endTime = data.endTime
	model.isCompleted = isCompleted
}

export function mapToShearingRecord(
	model: ShearingRecordModel,
): ShearingRecord {
	return {
		id: model.id,
		permitId: model.permitId,
		tagNumber: model.tagNumber,
		sex: model.sex,
		ageCategory: model.ageCategory,
		liveWeight: model.liveWeight,
		fiberLength: model.fiberLength,
		bodyCondition: model.bodyCondition,
		gestationStatus: model.gestationStatus,
		externalParasites: model.externalParasites,
		mangeSeverity: model.mangeSeverity,
		hasDandruff: model.hasDandruff,
		isSheared: model.isSheared,
		isDead: model.isDead,
		observations: model.observations,
	}
}

export function mapToShearingRecordFormData(
	model: ShearingRecordModel,
): ShearingRecordFormData {
	return {
		tagNumber: model.tagNumber,
		sex: model.sex,
		ageCategory: model.ageCategory,
		liveWeight: model.liveWeight,
		fiberLength: model.fiberLength,
		bodyCondition: model.bodyCondition,
		gestationStatus: model.gestationStatus,
		externalParasites: model.externalParasites,
		mangeSeverity: model.mangeSeverity,
		hasDandruff: model.hasDandruff,
		isSheared: model.isSheared,
		isDead: model.isDead,
		observations: model.observations,
	}
}

export function applyShearingRecordToModel(
	model: ShearingRecordModel,
	data: ShearingRecordFormData,
	permitId?: string,
): void {
	if (permitId) model.permitId = permitId
	model.tagNumber = data.tagNumber
	model.sex = data.sex
	model.ageCategory = data.ageCategory
	model.liveWeight = data.liveWeight
	model.fiberLength = data.fiberLength
	model.bodyCondition = data.bodyCondition
	model.gestationStatus = data.gestationStatus
	model.externalParasites = data.externalParasites
	model.mangeSeverity = data.mangeSeverity
	model.hasDandruff = data.hasDandruff
	model.isSheared = data.isSheared
	model.isDead = data.isDead
	model.observations = data.observations
}
