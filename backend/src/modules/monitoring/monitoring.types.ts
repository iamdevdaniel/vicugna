import type { PermitSyncStatus } from "@shared"

export interface MonitoringSeasonOption {
	id: string
	name: string
}

export interface MonitoringAssignedUser {
	userId: string
	fullName: string
}

export interface MonitoringPermitGroup {
	permitId: string
	communityId: string
	communityName: string
	permitNumber: string
	syncStatus: PermitSyncStatus
	syncedAt: string | null
	participantsCount: number | null
	cleaningRecordsCount: number | null
	shearingRecordsCount: number | null
	user: MonitoringAssignedUser
}

export interface SelectedMonitoringPermit {
	permitId: string
	communityId: string
	communityName: string
	permitNumber: string
	syncStatus: PermitSyncStatus
	syncedAt: string | null
	syncedAtLabel: string | null
	participantsCount: number | null
	cleaningRecordsCount: number | null
	shearingRecordsCount: number | null
	user: MonitoringAssignedUser
}

export interface MonitoringCommunityGroup {
	communityId: string
	communityName: string
	permits: MonitoringPermitGroup[]
}

export interface MonitoringPageState {
	selectedSeasonId: string
	seasons: MonitoringSeasonOption[]
	communitiesCount: number
	permitsCount: number
	assignedUsersCount: number
	communityGroups: MonitoringCommunityGroup[]
	selectedPermit: SelectedMonitoringPermit | null
}
