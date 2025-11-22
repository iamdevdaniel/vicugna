import type { SyncStage } from "./enums"

export type SyncMeta = {
	stage: SyncStage
	timestamp: number
	errorMessage?: string
}

export type Form11Storage = {
	id?: string
	sync: SyncMeta
	shearing: Form11Shearing
	dehearing: Form11Dehearing
	records: Form11Record[]
}

export type Form11Shearing = {
	id?: string
	departamento: string
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	codigoAutorizacion: string
}

export type Form11Dehearing = {
	id?: string
	fechaInicioPredescerdado: string
	fechaFinPredescerdado: string
	lugarPredescerdado: string
	responsablesPredescerdado: string
}

export type Form11Record = {
	id?: string
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
