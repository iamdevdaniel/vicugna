export class UserManagementError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "UserManagementError"
	}
}
