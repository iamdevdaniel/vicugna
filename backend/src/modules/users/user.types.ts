// Domain
export type ManagedUserRole = "admin" | "user"

export interface UserListItem {
	id: string
	fullName: string
	phoneNumber: string
	email: string | null
	role: ManagedUserRole
	isActive: boolean
}

// HTTP
export interface CreateUserFormData {
	fullName: string
	phoneNumber: string
	email: string
	password: string
}

// View
export interface UsersPageData {
	pageTitle: string
	adminUser: {
		fullName: string
	}
	users: UserListItem[]
	suggestedPassword: string
}
