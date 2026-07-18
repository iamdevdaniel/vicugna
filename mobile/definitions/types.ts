import type {
	BasicInfoData,
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GroomingData,
	ParticipantData,
	ShearingHeaderData,
	ShearingRecordData,
} from "@vicugna/shared"

export type {
	BasicInfoData,
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GenderData,
	GroomingData,
	ParticipantData,
	PermitSyncData,
	ShearingHeaderData,
	ShearingRecordData,
} from "@vicugna/shared"

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
}

export type MobileLoginResponseData = {
	token: string
	expiresAt: string
	user: MobileAuthUser
}

export type BasicInfoFormData = Omit<
	BasicInfoData,
	"id" | "isCompleted" | "permitId"
>

// PARTICIPANTS

export type ParticipantFormData = Omit<ParticipantData, "id" | "permitId">

// SHEARING

export type ShearingHeaderFormData = Omit<
	ShearingHeaderData,
	"id" | "permitId" | "isCompleted"
>

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
