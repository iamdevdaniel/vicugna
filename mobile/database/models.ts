import { Model } from "@nozbe/watermelondb"
import { field, text } from "@nozbe/watermelondb/decorators"

export class PermitModel extends Model {
	static table = "permits"
	@text("seasonId") seasonId!: string
	@text("seasonName") seasonName!: string
	@text("communityId") communityId!: string
	@text("regionalId") regionalId!: string
	@text("departmentId") departmentId!: string
	@text("permitNumber") permitNumber!: string
	@text("userId") userId!: string
	@text("userFullName") userFullName!: string
	@field("isActiveAssignmentUser") isActiveAssignmentUser!: boolean
	@text("site") site!: string
	@text("date") date!: string
}

export class BasicInfoModel extends Model {
	static table = "basicInfo"
	@field("permitId") permitId!: string
	@text("site") site!: string
	@text("date") date!: string
	@field("isCompleted") isCompleted!: boolean
}

export class ParticipantModel extends Model {
	static table = "participants"
	@field("permitId") permitId!: string
	@text("name") name!: string
	@text("lastNames") lastNames!: string
	@text("gender") gender!: "F" | "M"
	@text("identityNumber") identityNumber!: string
	@text("signature") signature!: string
	@text("notes") notes!: string
}

export class ShearingHeaderModel extends Model {
	static table = "shearingHeader"
	@field("permitId") permitId!: string
	@text("site") site!: string
	@field("latitude") latitude!: number
	@field("longitude") longitude!: number
	@field("roundupCount") roundupCount!: number
	@text("startTime") startTime!: string
	@text("endTime") endTime!: string
	@field("isCompleted") isCompleted!: boolean
}

export class ShearingRecordModel extends Model {
	static table = "shearingRecord"
	@field("permitId") permitId!: string
	@field("tagNumber") tagNumber!: number
	@text("sex") sex!: "F" | "M"
	@text("ageCategory") ageCategory!: "Cria" | "Juvenil" | "Adulto"
	@field("liveWeight") liveWeight!: number
	@field("fiberLength") fiberLength!: number
	@text("bodyCondition") bodyCondition!: "Malo" | "Regular" | "Bueno"
	@text("gestationStatus") gestationStatus!: "No" | "Si" | "Si ultimo tercio"
	@text("externalParasites") externalParasites!:
		| "Ninguno"
		| "Garrapata"
		| "Piojos"
	@text("mangeSeverity") mangeSeverity!:
		| "Ninguna"
		| "Leve"
		| "Moderado"
		| "Severo"
	@field("hasDandruff") hasDandruff!: boolean
	@field("isSheared") isSheared!: boolean
	@field("isDead") isDead!: boolean
	@text("observations") observations!: string
}

export class CleaningHeaderModel extends Model {
	static table = "cleaningHeader"
	@field("permitId") permitId!: string
	@text("startDate") startDate!: string
	@text("endDate") endDate!: string
	@text("site") site!: string
	@text("supervisors") supervisors!: string
	@field("isCompleted") isCompleted!: boolean
}

export class CleaningCommonModel extends Model {
	static table = "cleaningCommon"
	@field("permitId") permitId!: string
	@text("fleeceNumber") fleeceNumber!: string
	@field("grossWeight") grossWeight!: number
}

export class GroomingModel extends Model {
	static table = "grooming"
	@field("cleaningCommonId") cleaningCommonId!: string
	@field("cleanWeight") cleanWeight!: number
	@field("dirtyWeight") dirtyWeight!: number
	@field("totalWeight") totalWeight!: number
	@field("isCompleted") isCompleted!: boolean
}

export class DehearingModel extends Model {
	static table = "dehearing"
	@field("cleaningCommonId") cleaningCommonId!: string
	@field("dehairedWeight") dehairedWeight!: number
	@field("bristleWeight") bristleWeight!: number
	@field("hasDandruff") hasDandruff!: boolean
	@text("dehairerName") dehairerName!: string
	@text("signature") signature!: string
	@field("isCompleted") isCompleted!: boolean
}
