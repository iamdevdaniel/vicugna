import { Model, type Relation } from "@nozbe/watermelondb"
import { field, relation, text } from "@nozbe/watermelondb/decorators"

export class BasicInfoModel extends Model {
	static table = "basicInfo"
	@field("permitId") permitId!: string
	@text("departament") departament!: string
	@text("regional") regional!: string
	@text("community") community!: string
	@text("site") site!: string
	@text("date") date!: string
	@field("isCompleted") isCompleted!: boolean
}

export class Form11ShearingModel extends Model {
	static table = "form11Shearing"
	@text("departament") departament!: string
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
