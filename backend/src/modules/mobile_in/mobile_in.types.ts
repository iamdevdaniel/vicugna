import type { PermitFieldData, PermitSyncStatus } from "@shared"

export type {
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GroomingData,
	ParticipantData,
	PermitData,
	ShearingHeaderData,
	ShearingRecordData,
} from "@shared"

export type SyncFieldData = PermitFieldData & {
	permitId: string
	baseHash: string
	hashVersion: number
}

export type PermitSyncResult = {
	permitId: string
	syncStatus: PermitSyncStatus
	serverHash: string
	hashVersion: number
	syncedAt: string | null
}
