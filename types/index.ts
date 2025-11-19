export type Form11Header = {
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	codigoAutorizacion: string
	fechaInicioPredescerdado: string
	fechaFinPredescerdado: string
	lugarPredescerdado: string
	responsablesPredescerdado: string
}

export type Form11Body = {
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
