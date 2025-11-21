export enum SyncStatus {
	Unsynced = "unsynced",
	Synced = "synced",
	Failed = "failed",
}

export type SyncState = {
	status: SyncStatus
	timestamp: number
	errorMessage?: string
}

export type ShearingRecord = {
	id: string
	data: Form11Shearing
	sync: SyncState
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
