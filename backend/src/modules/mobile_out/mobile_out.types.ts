import type { PermitSyncStatus } from "@shared"

export interface MobilePermitData {
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
	syncStatus: PermitSyncStatus
	syncedAt: string | null
}
