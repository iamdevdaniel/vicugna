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
	ShearingHeaderSaveData,
	ShearingRecordData,
	ShearingRecordFormData,
} from "@definitions/types"
import { calculateTotalWeight } from "@utils/grooming-record-rules"
import {
	deriveIsSheared,
	normalizeGestationStatus,
} from "@utils/shearing-record-rules"
import type { PermitData as SyncPermitData } from "@vicugna/shared"
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
		...mapToSyncPermit(model),
		participantsStatus: model.participantsStatus,
		shearingStatus: model.shearingStatus,
		cleaningStatus: model.cleaningStatus,
	}
}

export function mapToSyncPermit(model: PermitModel): SyncPermitData {
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
		syncStatus: model.permitSyncStatus,
		syncedAt: model.syncedAt,
	}
}

export function applyPermitToModel(model: PermitModel, data: PermitData): void {
	applySyncPermitToModel(model, data)
	model.participantsStatus = data.participantsStatus
	model.shearingStatus = data.shearingStatus
	model.cleaningStatus = data.cleaningStatus
}

export function applySyncPermitToModel(
	model: PermitModel,
	data: SyncPermitData,
): void {
	model.seasonId = data.seasonId
	model.seasonName = data.seasonName
	model.communityId = data.communityId
	model.regionalId = data.regionalId
	model.departmentId = data.departmentId
	model.permitNumber = data.permitNumber
	model.userId = data.userId
	model.userFullName = data.userFullName
	model.isActiveAssignmentUser = data.isActiveAssignmentUser
	model.permitSyncStatus = data.syncStatus
	model.syncedAt = data.syncedAt
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
		eventDate: model.eventDate,
		startTime: model.startTime,
		endTime: model.endTime,
		isCompleted: model.isCompleted,
	}
}

export function applyShearingHeaderToModel(
	model: ShearingHeaderModel,
	data: ShearingHeaderSaveData,
	isCompleted: boolean,
) {
	model.site = data.site
	model.latitude = data.latitude
	model.longitude = data.longitude
	model.roundupCount = data.roundupCount
	model.eventDate = data.eventDate
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
		tagNumber: model.tagNumber.toString(),
		sex: model.sex,
		ageCategory: model.ageCategory,
		liveWeight: model.liveWeight.toString(),
		fiberLength: model.fiberLength.toString(),
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
	const gestationStatus = normalizeGestationStatus(
		data.sex,
		data.ageCategory,
		data.gestationStatus,
	)

	if (permitId) model.permitId = permitId
	model.tagNumber = Number(data.tagNumber)
	model.sex = data.sex
	model.ageCategory = data.ageCategory
	model.liveWeight = Number(data.liveWeight)
	model.fiberLength = Number(data.fiberLength)
	model.bodyCondition = data.bodyCondition
	model.gestationStatus = gestationStatus
	model.externalParasites = data.externalParasites
	model.mangeSeverity = data.mangeSeverity
	model.hasDandruff = data.hasDandruff
	model.isSheared = deriveIsSheared(data.ageCategory, gestationStatus)
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
): void {
	model.startDate = data.startDate
	model.endDate = data.endDate
	model.site = data.site
	model.supervisors = data.supervisors
	model.isCompleted = Boolean(
		data.startDate.trim() &&
			data.endDate.trim() &&
			data.site.trim() &&
			data.supervisors.trim(),
	)
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
	model.grossWeight = Number(data.grossWeight)
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
	const totalWeight = calculateTotalWeight(data.cleanWeight, data.dirtyWeight)
	if (!totalWeight) throw new Error("Invalid grooming weights")

	if (cleaningCommonId) model.cleaningCommonId = cleaningCommonId
	model.cleanWeight = Number(data.cleanWeight)
	model.dirtyWeight = Number(data.dirtyWeight)
	model.totalWeight = Number(totalWeight)
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
	model.dehairedWeight = Number(data.dehairedWeight)
	model.bristleWeight = Number(data.bristleWeight)
	model.hasDandruff = data.hasDandruff
	model.dehairerName = data.dehairerName
	model.signature = data.signature
	model.isCompleted = true
}
