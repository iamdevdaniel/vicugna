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
	externalParasites: "Ninguno" | "Garrapata" | "Piojos"
	mangeSeverity: "Ninguna" | "Leve" | "Moderado" | "Severo"
	hasDandruff: boolean
	isSheared: boolean
	isDead: boolean
	observations: string
}

export type ShearingRecordFormData = Omit<ShearingRecord, "id" | "permitId">
