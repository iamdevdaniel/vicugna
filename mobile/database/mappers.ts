import type {
	BasicInfo,
	BasicInfoFormData,
	CleaningCommon,
	CleaningCommonFormData,
	CleaningHeader,
	CleaningHeaderFormData,
	Dehearing,
	DehearingFormData,
	Grooming,
	GroomingFormData,
	Participant,
	ParticipantFormData,
	ShearingHeader,
	ShearingHeaderFormData,
	ShearingRecord,
	ShearingRecordFormData,
} from "@definitions/types"
import type {
	BasicInfoModel,
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
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

export function mapToCleaningHeader(
	model: CleaningHeaderModel,
): CleaningHeader {
	return {
		id: model.id,
		permitId: model.permitId,
		startDate: model.startDate,
		endDate: model.endDate,
		site: model.site,
		supervisors: model.supervisors,
		isCompleted: model.isCompleted,
	}
}

export function applyCleaningHeaderToModel(
	model: CleaningHeaderModel,
	data: CleaningHeaderFormData,
	isCompleted: boolean,
): void {
	model.startDate = data.startDate
	model.endDate = data.endDate
	model.site = data.site
	model.supervisors = data.supervisors
	model.isCompleted = isCompleted
}

export function mapToCleaningCommon(
	model: CleaningCommonModel,
): CleaningCommon {
	return {
		id: model.id,
		permitId: model.permitId,
		fleeceNumber: model.fleeceNumber,
		grossWeight: model.grossWeight,
	}
}

export function applyCleaningCommonToModel(
	model: CleaningCommonModel,
	data: CleaningCommonFormData,
	permitId?: string,
): void {
	if (permitId) model.permitId = permitId
	model.fleeceNumber = data.fleeceNumber
	model.grossWeight = data.grossWeight
}

export function mapToGrooming(model: GroomingModel): Grooming {
	return {
		id: model.id,
		cleaningCommonId: model.cleaningCommonId,
		cleanWeight: model.cleanWeight,
		dirtyWeight: model.dirtyWeight,
		totalWeight: model.totalWeight,
		isCompleted: model.isCompleted,
	}
}

export function applyGroomingToModel(
	model: GroomingModel,
	data: GroomingFormData,
	cleaningCommonId?: string,
): void {
	if (cleaningCommonId) model.cleaningCommonId = cleaningCommonId
	model.cleanWeight = data.cleanWeight
	model.dirtyWeight = data.dirtyWeight
	model.totalWeight = data.totalWeight
	model.isCompleted = true
}

export function mapToDehearing(model: DehearingModel): Dehearing {
	return {
		id: model.id,
		cleaningCommonId: model.cleaningCommonId,
		dehairedWeight: model.dehairedWeight,
		bristleWeight: model.bristleWeight,
		hasDandruff: model.hasDandruff,
		dehairerName: model.dehairerName,
		signature: model.signature,
		isCompleted: model.isCompleted,
	}
}

export function applyDehearingToModel(
	model: DehearingModel,
	data: DehearingFormData,
	cleaningCommonId?: string,
): void {
	if (cleaningCommonId) model.cleaningCommonId = cleaningCommonId
	model.dehairedWeight = data.dehairedWeight
	model.bristleWeight = data.bristleWeight
	model.hasDandruff = data.hasDandruff
	model.dehairerName = data.dehairerName
	model.signature = data.signature
	model.isCompleted = true
}
