export class MobileAuthError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "MobileAuthError"
	}
}
