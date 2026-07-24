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
