import type {
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GroomingData,
	ParticipantData,
	ShearingHeaderData,
	ShearingRecordData,
	PermitData as SyncPermitData,
} from "@vicugna/shared"

export type {
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GenderData,
	GroomingData,
	MobilePermitData,
	ParticipantData,
	PermitFieldData,
	PermitSyncResult,
	PermitSyncStatus,
	ShearingHeaderData,
	ShearingRecordData,
	SyncFieldData,
} from "@vicugna/shared"

export type PermitStepStatus = "ready" | "done" | "disabled"

export interface PermitData extends SyncPermitData {
	participantsStatus: PermitStepStatus
	shearingStatus: PermitStepStatus
	cleaningStatus: PermitStepStatus
}

export type AdminPermit = {
	id: string
	date: string
	site: string
	codigoAutorizacion: string
}

export type MobileAuthUser = {
	id: string
	email: string
	fullName: string
	role: "user"
	avatarSeed: string
}

export type MobileLoginResponseData = {
	token: string
	expiresAt: string
	user: MobileAuthUser
}

// PARTICIPANTS

export type ParticipantFormData = Omit<ParticipantData, "id" | "permitId">

// SHEARING

export type ShearingHeaderSaveData = Omit<
	ShearingHeaderData,
	"id" | "permitId" | "isCompleted"
>

export type ShearingHeaderFormData = Omit<
	ShearingHeaderSaveData,
	"latitude" | "longitude" | "roundupCount"
> & {
	latitude: string
	longitude: string
	roundupCount: string
}

export type ShearingRecordFormData = Omit<
	ShearingRecordData,
	"id" | "permitId" | "tagNumber" | "liveWeight" | "fiberLength"
> & {
	tagNumber: string
	liveWeight: string
	fiberLength: string
}

// CLEANING

export type CleaningHeaderFormData = Omit<
	CleaningHeaderData,
	"id" | "permitId" | "isCompleted"
>

export type CleaningCommonFormData = Omit<
	CleaningCommonData,
	"id" | "permitId" | "grossWeight"
> & {
	grossWeight: string
}

export type GroomingFormData = Omit<
	GroomingData,
	| "id"
	| "cleaningCommonId"
	| "isCompleted"
	| "cleanWeight"
	| "dirtyWeight"
	| "totalWeight"
> & {
	cleanWeight: string
	dirtyWeight: string
	totalWeight: string
}

export type DehearingFormData = Omit<
	DehearingData,
	| "id"
	| "cleaningCommonId"
	| "isCompleted"
	| "dehairedWeight"
	| "bristleWeight"
> & {
	dehairedWeight: string
	bristleWeight: string
}
