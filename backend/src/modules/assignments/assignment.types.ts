// HTTP
export interface CreateAssignmentFormData {
	seasonId: string
	communityId: string
	userId: string
	permitNumbers: string[]
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
	permitCount: number
}

export interface AssignmentPageData {
	pageTitle: string
	adminUser: {
		fullName: string
	}
	seasons: SelectOption[]
	communities: SelectOption[]
	users: ManagedUserOption[]
	assignments: AssignmentListItem[]
}
