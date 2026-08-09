export class MonitoringError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "MonitoringError"
	}
}
