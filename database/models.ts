import { Model, type Relation } from "@nozbe/watermelondb"
import { field, relation, text } from "@nozbe/watermelondb/decorators"

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

export class ShearingHeader extends Model {
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

export class ShearingRecord extends Model {
	static table = "shearingRecord"
	@field("permitId") permitId!: string
	@field("tagNumber") tagNumber!: number
	@text("sex") sex!: "F" | "M"
	@text("ageCategory") ageCategory!: "Cria" | "Juvenil" | "Adulto"
	@field("liveWeight") liveWeight!: number
	@field("fiberLength") fiberLength!: number
	@text("bodyCondition") bodyCondition!: "Malo" | "Regular" | "Bueno"
	@text("gestationStatus") gestationStatus!: "No" | "Si" | "Si ultimo tercio"
	@text("externalParasites") externalParasites!: "Garrapata" | "Piojos" | null
	@text("mangeSeverity") mangeSeverity!: "Leve" | "Moderado" | "Severo" | null
	@field("hasDandruff") hasDandruff!: boolean
	@field("isSheared") isSheared!: boolean
	@field("isDead") isDead!: boolean
	@text("observations") observations!: string
}

export class Form11ShearingModel extends Model {
	static table = "form11Shearing"
	@text("department") department!: string
	@text("regional") regional!: string
	@text("community") community!: string
	@text("site") site!: string
	@text("date") date!: string
	@text("codigoAutorizacion") codigoAutorizacion!: string
	@field("isCompleted") isCompleted!: boolean
}

export class Form11DehearingModel extends Model {
	static table = "form11Dehearing"
	@text("startDate") startDate!: string
	@text("endDate") endDate!: string
	@text("site") site!: string
	@text("supervisors") supervisors!: string
	@field("isCompleted") isCompleted!: boolean
}

export class Form11RecordModel extends Model {
	static table = "form11Record"
	@field("form11StorageId") form11StorageId!: string
	@text("tagId") tagId!: string
	@text("pesoFibraBruto") pesoFibraBruto!: string
	@text("pesoVellonLimpio") pesoVellonLimpio!: string
	@text("pesoBraga") pesoBraga!: string
	@text("pesoTotalFibra") pesoTotalFibra!: string
	@text("pesoFibraPredescerdada") pesoFibraPredescerdada!: string
	@text("pesoCerda") pesoCerda!: string
	@text("caspa") caspa!: "SI" | "NO"
	@text("nombrePredescerdador") nombrePredescerdador!: string
}

export class Form11StorageModel extends Model {
	static table = "form11Storage"
	static associations = {
		form11Shearing: { type: "belongs_to" as const, key: "shearingId" },
		form11Dehearing: { type: "belongs_to" as const, key: "dehearingId" },
	}
	@relation("form11Shearing", "shearingId")
	shearing!: Relation<Form11ShearingModel>
	@relation("form11Dehearing", "dehearingId")
	dehearing!: Relation<Form11DehearingModel>
}
