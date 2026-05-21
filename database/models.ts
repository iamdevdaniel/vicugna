import { Model, type Relation } from "@nozbe/watermelondb"
import { field, relation, text } from "@nozbe/watermelondb/decorators"

export class BasicInfoModel extends Model {
	static table = "basicInfo"
	@text("asociacionRegional") asociacionRegional!: string
	@text("comunidadManejadora") comunidadManejadora!: string
	@text("sitioCaptura") sitioCaptura!: string
	@text("fechaCaptura") fechaCaptura!: string
	@text("codigoAutorizacion") codigoAutorizacion!: string
	@field("is_completed") isCompleted!: boolean
}

export class Form11ShearingModel extends Model {
	static table = "form11Shearing"
	@text("departamento") departamento!: string
	@text("asociacionRegional") asociacionRegional!: string
	@text("comunidadManejadora") comunidadManejadora!: string
	@text("sitioCaptura") sitioCaptura!: string
	@text("fechaCaptura") fechaCaptura!: string
	@text("codigoAutorizacion") codigoAutorizacion!: string
	@field("is_completed") isCompleted!: boolean
}

export class Form11DehearingModel extends Model {
	static table = "form11Dehearing"
	@text("fechaInicioPredescerdado") fechaInicioPredescerdado!: string
	@text("fechaFinPredescerdado") fechaFinPredescerdado!: string
	@text("lugarPredescerdado") lugarPredescerdado!: string
	@text("responsablesPredescerdado") responsablesPredescerdado!: string
	@field("is_completed") isCompleted!: boolean
}

export class Form11RecordModel extends Model {
	static table = "form11Record"
	@field("form11StorageId") form11StorageId!: string
	@text("ficha") ficha!: string
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
