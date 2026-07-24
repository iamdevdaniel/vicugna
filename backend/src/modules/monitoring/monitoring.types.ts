export interface MonitoringSeasonOption {
	id: string
	name: string
}

export interface MonitoringAssignedUser {
	userId: string
	fullName: string
	active: boolean
}

export interface MonitoringPermitGroup {
	permitId: string
	communityId: string
	communityName: string
	permitNumber: string
	isSynced: boolean
	syncedAt: string | null
	participantsCount: number | null
	cleaningRecordsCount: number | null
	shearingRecordsCount: number | null
	users: MonitoringAssignedUser[]
}

export interface SelectedMonitoringPermit {
	permitId: string
	communityId: string
	communityName: string
	permitNumber: string
	isSynced: boolean
	syncedAt: string | null
	assignedUsersCount: number
}

export interface MonitoringCommunityGroup {
	communityId: string
	communityName: string
	permits: MonitoringPermitGroup[]
}

export interface MonitoringPageData {
	pageTitle: string
	adminUser: {
		fullName: string
	}
	selectedSeasonId: string
	seasons: MonitoringSeasonOption[]
	communitiesCount: number
	permitsCount: number
	assignedUsersCount: number
	communityGroups: MonitoringCommunityGroup[]
	selectedPermit: SelectedMonitoringPermit | null
}
