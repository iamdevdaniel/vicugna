import type {
	BasicInfo,
	BasicInfoFormData,
	Participant,
	ParticipantFormData,
	ShearingHeader,
	ShearingHeaderFormData,
	ShearingRecord,
	ShearingRecordFormData,
} from "@definitions/types"
import type {
	BasicInfoModel,
	ParticipantModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"

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
