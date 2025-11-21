import { Model } from "@nozbe/watermelondb"
import { field, text } from "@nozbe/watermelondb/decorators"

export class Form11ShearingModel extends Model {
	static table = "form11_shearing"
	@text("departamento") departamento!: string
	@text("asociacionRegional") asociacionRegional!: string
	@text("comunidadManejadora") comunidadManejadora!: string
	@text("sitioCaptura") sitioCaptura!: string
	@text("fechaCaptura") fechaCaptura!: string
	@text("codigoAutorizacion") codigoAutorizacion!: string
}

export class Form11DehearingModel extends Model {
	static table = "form11_dehearing"
	@text("fechaInicioPredescerdado") fechaInicioPredescerdado!: string
	@text("fechaFinPredescerdado") fechaFinPredescerdado!: string
	@text("lugarPredescerdado") lugarPredescerdado!: string
	@text("responsablesPredescerdado") responsablesPredescerdado!: string
}

export class Form11RecordModel extends Model {
	static table = "form11_record"
	@field("storageId") storageId!: string
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

export class SyncMetaModel extends Model {
	static table = "sync_meta"
	@text("status") status!: "unsynced" | "synced" | "failed"
	@field("timestamp") timestamp!: number
	@text("errorMessage") errorMessage?: string
}

export class Form11StorageModel extends Model {
	static table = "form11_storage"
	@field("sync") sync!: string
	@field("shearingId") shearingId!: string
	@field("dehearingId") dehearingId!: string
}
