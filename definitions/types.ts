export type AdminPermit = {
	fechaCaptura: string
	sitioCaptura: string
	codigoAutorizacion: string
}

// FORM 11

export type Form11Storage = {
	id: string
	shearing: Form11Shearing
	dehearing: Form11Dehearing
	recordCount: number
}

export type Form11Shearing = {
	id?: string
	departamento: string
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	codigoAutorizacion: string
	isCompleted: boolean
}

export type Form11Dehearing = {
	id?: string
	fechaInicioPredescerdado: string
	fechaFinPredescerdado: string
	lugarPredescerdado: string
	responsablesPredescerdado: string
	isCompleted: boolean
}

export type Form11ShearingFormData = Omit<Form11Shearing, "isCompleted">
export type Form11DehearingFormData = Omit<Form11Dehearing, "isCompleted">

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
