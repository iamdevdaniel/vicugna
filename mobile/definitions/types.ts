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

export type ShearingRecordFormData = Omit<ShearingRecordData, "id" | "permitId">

// CLEANING

export type CleaningHeaderFormData = Omit<
	CleaningHeaderData,
	"id" | "permitId" | "isCompleted"
>

export type CleaningCommonFormData = Omit<CleaningCommonData, "id" | "permitId">

export type GroomingFormData = Omit<
	GroomingData,
	"id" | "cleaningCommonId" | "isCompleted"
>

export type DehearingFormData = Omit<
	DehearingData,
	"id" | "cleaningCommonId" | "isCompleted"
>
