import { Model } from "@nozbe/watermelondb"
import { field, text } from "@nozbe/watermelondb/decorators"

export class BasicInfoModel extends Model {
	static table = "basicInfo"
	@field("permitId") permitId!: string
	@text("department") department!: string
	@text("regional") regional!: string
	@text("community") community!: string
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
