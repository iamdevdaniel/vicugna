import sharedErrors from "@shared/errors.json"
import type { PermitDataValidationDetails } from "@shared/permit-data-validation"

export const { permitSyncErrors, permitValidationErrors } = sharedErrors

type PermitValidationDefinition = { code: string; message: string }

type PermitSyncErrorDefinition =
	(typeof permitSyncErrors)[keyof typeof permitSyncErrors]

export class PermitValidationError extends Error {
	constructor(
		readonly definition: PermitValidationDefinition,
		readonly logDetails?: PermitDataValidationDetails,
	) {
		super(definition.message)
		this.name = "PermitValidationError"
	}

	get code() {
		return this.definition.code
	}
}

export class PermitSyncError extends Error {
	constructor(readonly definition: PermitSyncErrorDefinition) {
		super(definition.message)
		this.name = "PermitSyncError"
	}

	get code() {
		return this.definition.code
	}

	get status() {
		return this.definition.status
	}
}
