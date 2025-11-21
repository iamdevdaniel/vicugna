export enum SyncStage {
	Unsynced = "unsynced",
	Synced = "synced",
	Failed = "failed",
}

export type SyncMeta = {
	status: SyncStage
	timestamp: number
	errorMessage?: string
}

export type Form11Storage = {
	id: string
	sync: SyncMeta
	formData: {
		shearing: Form11Shearing
		dehearing: Form11Dehearing
		record: Form11Record[]
	}
}

export type Form11Shearing = {
	departamento: string
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	codigoAutorizacion: string
}

export type Form11Dehearing = {
	fechaInicioPredescerdado: string
	fechaFinPredescerdado: string
	lugarPredescerdado: string
	responsablesPredescerdado: string
}

export type Form11Record = {
	ficha: string
	pesoFibraBruto: string
	pesoVellonLimpio: string
	pesoBraga: string
	pesoTotalFibra: string
	pesoFibraPredescerdada: string
	pesoCerda: string
	caspa: "SI" | "NO"
	nombrePredescerdador: string
}
