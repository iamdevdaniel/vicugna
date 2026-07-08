// HTTP
export interface CreateAssignmentFormData {
	seasonId: string
	communityId: string
	userId: string
	permitId: string
}

export type CreateAssignmentFormRequestBody = CreateAssignmentFormData

export interface CreatePermitFormData {
	seasonId: string
	communityId: string
	permitNumber: string
}

// View
export interface SelectOption {
	id: string
	name: string
}

export interface ManagedUserOption extends SelectOption {
	isActive: boolean
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
	seasons: SelectOption[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignments: AssignmentListItem[]
}
