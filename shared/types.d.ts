export type SyncFieldData = {
	permit: PermitData
	participants: ParticipantData[]
	shearingHeader: ShearingHeaderData
	shearingRecords: ShearingRecordData[]
	cleaningHeader: CleaningHeaderData
	cleaningCommonRecords: CleaningCommonData[]
	groomingDetails: GroomingData[]
	dehearingDetails: DehearingData[]
}

export type PermitData = {
	id: string
	permitNumber: string
	seasonId: string
	seasonName: string
	communityId: string
	regionalId: string
	departmentId: string
	userId: string
	userFullName: string
	isActiveAssignmentUser: boolean
	isSynced: boolean
	syncedAt: string | null
}

export type GenderData = "M" | "F"

export type ParticipantData = {
	id: string
	permitId: string
	name: string
	lastNames: string
	gender: GenderData
	identityNumber: string
	signature: string
	notes: string
}

export type ShearingHeaderData = {
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

export type ShearingRecordData = {
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

export type CleaningHeaderData = {
	id: string
	permitId: string
	startDate: string
	endDate: string
	site: string
	supervisors: string
	isCompleted: boolean
}

export type CleaningCommonData = {
	id: string
	permitId: string
	fleeceNumber: string
	grossWeight: number
}

export type GroomingData = {
	id: string
	cleaningCommonId: string
	cleanWeight: number
	dirtyWeight: number
	totalWeight: number
	isCompleted: boolean
}

export type DehearingData = {
	id: string
	cleaningCommonId: string
	dehairedWeight: number
	bristleWeight: number
	hasDandruff: boolean
	dehairerName: string
	signature: string
	isCompleted: boolean
}
