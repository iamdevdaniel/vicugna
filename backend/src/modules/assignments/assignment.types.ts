// HTTP
export interface CreateAssignmentData {
	seasonId: string
	communityId: string
	userId: string
	permitId: string
}

export interface CreatePermitFormData {
	seasonId: string
	communityId: string
	permitNumber: string
}

export interface AssignmentMutationRequestBody {
	seasonId: string
	communityId: string
	permitId: string
	assignmentId: string
}

// View
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
}

export interface AssignmentListItem {
	id: string
	permitId: string
	communityId: string
	userId: string
	active: boolean
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
	users: Array<{
		assignmentId: string
		userId: string
		userFullName: string
		active: boolean
	}>
}

export interface AssignmentPageData {
	pageTitle: string
	adminUser: {
		fullName: string
	}
	formMessage: string | null
	selectedSeasonId: string
	selectedCommunityId: string
	selectedPermit: SelectedPermitData | null
	seasons: SelectOption[]
	permits: PermitListItem[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignments: AssignmentListItem[]
	assignmentCards: AssignmentPermitCard[]
}
