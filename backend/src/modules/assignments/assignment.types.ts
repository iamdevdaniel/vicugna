// HTTP
export interface CreateAssignmentData {
	seasonId: string
	communityId: string
	userId: string
	permitId: string
}

export interface CreateAssignmentFormRequestBody extends CreateAssignmentData {
	permitNumber: string
}

export interface CreatePermitFormData {
	seasonId: string
	permitNumber: string
}

// View
export interface SelectedPermitData {
	id: string
	seasonId: string
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
	permitNumber: string
}

export interface AssignmentListItem {
	id: string
	seasonName: string
	communityName: string
	userFullName: string
	permitNumber: string
}

export interface AssignmentPageData {
	pageTitle: string
	adminUser: {
		fullName: string
	}
	formMessage: string | null
	selectedSeasonId: string
	selectedPermit: SelectedPermitData | null
	seasons: SelectOption[]
	permits: PermitListItem[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignments: AssignmentListItem[]
}
