import type {
	CleaningCommonData,
	CleaningCommonFormData,
	CleaningHeaderData,
	CleaningHeaderFormData,
	DehearingData,
	DehearingFormData,
	GroomingData,
	GroomingFormData,
	ParticipantData,
	ParticipantFormData,
	PermitData,
	ShearingHeaderData,
	ShearingHeaderFormData,
	ShearingRecordData,
	ShearingRecordFormData,
} from "@definitions/types"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
	ParticipantModel,
	PermitModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"

export function mapToPermit(model: PermitModel): PermitData {
	return {
		id: model.id,
		permitNumber: model.permitNumber,
		seasonId: model.seasonId,
		seasonName: model.seasonName,
		communityId: model.communityId,
		regionalId: model.regionalId,
		departmentId: model.departmentId,
		userId: model.userId,
		userFullName: model.userFullName,
		isActiveAssignmentUser: model.isActiveAssignmentUser,
	}
}

export function applyPermitToModel(model: PermitModel, data: PermitData): void {
	model.seasonId = data.seasonId
	model.seasonName = data.seasonName
	model.communityId = data.communityId
	model.regionalId = data.regionalId
	model.departmentId = data.departmentId
	model.permitNumber = data.permitNumber
	model.userId = data.userId
	model.userFullName = data.userFullName
	model.isActiveAssignmentUser = data.isActiveAssignmentUser
}

export function mapToParticipant(m: ParticipantModel): ParticipantData {
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
): ShearingHeaderData {
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
): ShearingRecordData {
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
): CleaningHeaderData {
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
): CleaningCommonData {
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

export function mapToGrooming(model: GroomingModel): GroomingData {
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

export function mapToDehearing(model: DehearingModel): DehearingData {
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
