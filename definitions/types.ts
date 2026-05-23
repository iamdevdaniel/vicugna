export type AdminPermit = {
	id: string
	fechaCaptura: string
	sitioCaptura: string
	codigoAutorizacion: string
}

// BASIC INFO

export type BasicInfo = {
	id: string
	permitId: string
	departamento: string
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	isCompleted: boolean
}

export type BasicInfoFormData = Omit<
	BasicInfo,
	"id" | "isCompleted" | "permitId"
>

// FORM 11

export type Form11Storage = {
	id: string
	shearing: Form11Shearing
	dehearing: Form11Dehearing
	recordCount: number
}

export type Form11Shearing = {
	id: string
	departamento: string
	asociacionRegional: string
	comunidadManejadora: string
	sitioCaptura: string
	fechaCaptura: string
	codigoAutorizacion: string
	isCompleted: boolean
}

export type Form11Dehearing = {
	id: string
	fechaInicioPredescerdado: string
	fechaFinPredescerdado: string
	lugarPredescerdado: string
	responsablesPredescerdado: string
	isCompleted: boolean
}

export type Form11ShearingFormData = Omit<Form11Shearing, "id" | "isCompleted">
export type Form11DehearingFormData = Omit<
	Form11Dehearing,
	"id" | "isCompleted"
>

export type Form11Record = {
	id: string
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

export type Form11RecordFormData = Omit<Form11Record, "id">

// PARTICIPANTS

export type Participant = {
	id: string
	permitId: string
	nombre: string
	apellidos: string
	genero: string
	cedulaIdentidad: string
	firma: string
	notas: string
}

export type ParticipantFormData = Omit<Participant, "id" | "permitId">
