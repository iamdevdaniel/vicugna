import type { PermitSyncStatus } from "@shared"

// HTTP
export interface CreateAssignmentData {
	seasonId: string
	communityId: string
	userId: string
	permitId: string
}

export interface SavePermitAssignmentFormData {
	seasonId: string
	communityId: string
	permitId: string
	userId: string
}

export interface CreatePermitFormData {
	seasonId: string
	communityId: string
	permitNumber: string
}

export interface RenamePermitFormData {
	seasonId: string
	communityId: string
	permitId: string
	permitNumber: string
}

export interface AssignmentMutationRequestBody {
	seasonId: string
	communityId: string
	permitId: string
	assignmentId: string
}

export interface SelectedPermitData {
	id: string
	seasonId: string
	communityId: string
	permitNumber: string
}
export interface SelectOption {
	id: string
	name: string
}

export interface ManagedUserOption extends SelectOption {
	isActive: boolean
}

export interface PermitListItem {
	id: string
	communityId: string
	communityName: string
	permitNumber: string
	syncStatus: PermitSyncStatus
}

export interface AssignmentListItem {
	id: string
	permitId: string
	communityId: string
	userId: string
	seasonName: string
	communityName: string
	userFullName: string
	permitNumber: string
}

export interface AssignmentPermitCard {
	permitId: string
	permitNumber: string
	seasonName: string
	communityId: string
	communityName: string
	user: {
		assignmentId: string
		userId: string
		userFullName: string
	}
}

export interface AssignmentPageState {
	selectedSeasonId: string
	selectedCommunityId: string
	selectedPermit: SelectedPermitData | null
	seasons: SelectOption[]
	permits: PermitListItem[]
	communitiesWithPermitsCount: number
	permitsCount: number
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignments: AssignmentListItem[]
	assignmentCards: AssignmentPermitCard[]
}
