import type { ZodIssue } from "zod";
import type { PermitFieldData } from "./types";

export type PermitDataValidationRule =
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
	| "valid_time";

export type PermitDataValidationIssue = {
	path: string;
	rule: PermitDataValidationRule;
	expected?: number | string | { min: number; max: number };
};

export type PermitDataValidationDetails =
	| { source: "zod"; issues: ZodIssue[] }
	| { source: "service"; issue: PermitDataValidationIssue };

export class PermitDataValidationError extends Error {
	readonly code: string;
	readonly details?: PermitDataValidationDetails;
}

export function parseCompletePermitData(
	value: unknown,
	permitId: string,
): PermitFieldData;
