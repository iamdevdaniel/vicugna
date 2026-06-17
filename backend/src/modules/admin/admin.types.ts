export type UserRole = "admin" | "user"

export interface AdminSessionUser {
	id: string
	email: string
	fullName: string
	role: UserRole
}

export interface LoginFormData {
	email: string
	password: string
}
