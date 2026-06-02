export type AdminPermit = {
	id: string
	date: string
	site: string
	codigoAutorizacion: string
}

// BASIC INFO

export type BasicInfo = {
	id: string
	permitId: string
	department: string
	regional: string
	community: string
	site: string
	date: string
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
	department: string
	regional: string
	community: string
	site: string
	date: string
	codigoAutorizacion: string
	isCompleted: boolean
}

export type Form11Dehearing = {
	id: string
	startDate: string
	endDate: string
	site: string
	supervisors: string
	isCompleted: boolean
}

export type Form11ShearingFormData = Omit<Form11Shearing, "id" | "isCompleted">
export type Form11DehearingFormData = Omit<
	Form11Dehearing,
	"id" | "isCompleted"
>

export type Form11Record = {
	id: string
	tagId: string
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

export type Gender = "M" | "F"

export type Participant = {
	id: string
	permitId: string
	name: string
	lastNames: string
	gender: Gender
	identityNumber: string
	signature: string
	notes: string
}

export type ParticipantFormData = Omit<Participant, "id" | "permitId">

// SHEARING

export interface ShearingHeader {
	id: string
	permitId: string
	site: string
	latitude: number
	longitude: number
	roundupCount: number
	startTime: string
	endTime: string
	isCompleted: boolean
}

export type ShearingHeaderFormData = Omit<
	ShearingHeader,
	"id" | "permitId" | "isCompleted"
>

export type ShearingRecord = {
	id: string
	permitId: string
	tagNumber: number
	sex: "F" | "M"
	ageCategory: "Cria" | "Juvenil" | "Adulto"
	liveWeight: number
	fiberLength: number
	bodyCondition: "Malo" | "Regular" | "Bueno"
	gestationStatus: "No" | "Si" | "Si ultimo tercio"
	externalParasites: "Garrapata" | "Piojos" | null
	mangeSeverity: "Leve" | "Moderado" | "Severo" | null
	hasDandruff: boolean
	isSheared: boolean
	isDead: boolean
	observations: string
}

export type ShearingRecordFormData = Omit<ShearingRecord, "id" | "permitId">
