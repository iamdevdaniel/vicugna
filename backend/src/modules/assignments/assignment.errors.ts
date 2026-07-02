export class AssignmentManagementError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "AssignmentManagementError"
	}
}
