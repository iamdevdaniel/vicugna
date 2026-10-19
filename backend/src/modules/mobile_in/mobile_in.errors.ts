import sharedErrors from "@shared/errors.json"
import type { ZodIssue } from "zod"

export type ServiceValidationRule =
	| "after"
	| "date_format"
	| "finite_number"
	| "maximum"
	| "maximum_items"
	| "non_blank"
	| "positive"
	| "positive_integer"
	| "range"
	| "time_format"
	| "unique_items"
	| "valid_date"
	| "valid_time"

export type ServiceValidationIssue = {
	path: string
	rule: ServiceValidationRule
	expected?: number | string | { min: number; max: number }
}

export type PermitValidationLogDetails =
	| { source: "zod"; issues: ZodIssue[] }
	| { source: "service"; issue: ServiceValidationIssue }

export const { permitSyncErrors, permitValidationErrors } = sharedErrors

type PermitValidationDefinition =
	(typeof permitValidationErrors)[keyof typeof permitValidationErrors]

type PermitSyncErrorDefinition =
	(typeof permitSyncErrors)[keyof typeof permitSyncErrors]

export class PermitValidationError extends Error {
	constructor(
		readonly definition: PermitValidationDefinition,
		readonly logDetails?: PermitValidationLogDetails,
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
