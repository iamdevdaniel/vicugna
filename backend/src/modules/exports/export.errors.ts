export class PermitExportUnavailableError extends Error {
	constructor() {
		super("Permit sync data is not available")
		this.name = "PermitExportUnavailableError"
	}
}
