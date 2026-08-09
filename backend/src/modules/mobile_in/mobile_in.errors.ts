export class PermitValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitValidationError"
	}
}

export class PermitNotFoundError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitNotFoundError"
	}
}

export class PermitSyncForbiddenError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitSyncForbiddenError"
	}
}

export class PermitSyncConflictError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitSyncConflictError"
	}
}
