import {
	PermitValidationError,
	permitValidationErrors,
	type ServiceValidationIssue,
} from "./mobile_in.errors"

const CALENDAR_DATE_PATTERN = /^\d{1,2}\/\d{1,2}\/\d{4}$/
const TIME_PATTERN = /^\d{2}:\d{2}$/
const DATE_TIME_WITH_OFFSET_PATTERN =
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const POSITIVE_INTEGER_TEXT_PATTERN = /^\d+$/

export function validateNonBlankText(value: string, path: string): void {
	if (!value.trim()) {
		throwInvalidField(path, "non_blank")
	}
}

export function validatePositiveIntegerText(value: string, path: string): void {
	if (!POSITIVE_INTEGER_TEXT_PATTERN.test(value) || !/[1-9]/.test(value)) {
		throwInvalidField(path, "positive_integer")
	}
}

export function validatePositiveInteger(
	value: number,
	max: number,
	path: string,
): void {
	if (!Number.isSafeInteger(value) || value <= 0) {
		throwInvalidField(path, "positive_integer")
	}
	if (value > max) {
		throwInvalidField(path, "maximum", max)
	}
}

export function validatePositiveNumber(
	value: number,
	max: number | undefined,
	path: string,
): void {
	if (!Number.isFinite(value)) {
		throwInvalidField(path, "finite_number")
	}
	if (value <= 0) {
		throwInvalidField(path, "positive")
	}
	if (max !== undefined && value > max) {
		throwInvalidField(path, "maximum", max)
	}
}

export function validateNumberInRange(
	value: number,
	min: number,
	max: number,
	path: string,
): void {
	if (!Number.isFinite(value)) {
		throwInvalidField(path, "finite_number")
	}
	if (value < min || value > max) {
		throwInvalidField(path, "range", { min, max })
	}
}

export function validateCalendarDate(value: string, path: string): void {
	if (!CALENDAR_DATE_PATTERN.test(value)) {
		throwInvalidField(path, "date_format", "DD/MM/YYYY")
	}

	const [day, month, year] = value.split("/").map(Number)
	if (!isValidCalendarDate(year, month, day)) {
		throwInvalidField(path, "valid_date")
	}
}

export function validateDateTimeWithOffset(value: string, path: string): void {
	if (
		!DATE_TIME_WITH_OFFSET_PATTERN.test(value) ||
		Number.isNaN(Date.parse(value))
	) {
		throwInvalidField(
			path,
			"date_format",
			"ISO 8601 date-time with Z or a ±HH:mm time-zone offset",
		)
	}

	const [year, month, day] = value.slice(0, 10).split("-").map(Number)
	if (!isValidCalendarDate(year, month, day)) {
		throwInvalidField(path, "valid_date")
	}
}

export function validateTime(value: string, path: string): void {
	if (!TIME_PATTERN.test(value)) {
		throwInvalidField(path, "time_format", "HH:mm")
	}

	const [hours, minutes] = value.split(":").map(Number)
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		throwInvalidField(path, "valid_time")
	}
}

export function getTimeInMinutes(value: string): number {
	const [hours, minutes] = value.split(":").map(Number)
	return hours * 60 + minutes
}

function isValidCalendarDate(
	year: number,
	month: number,
	day: number,
): boolean {
	const date = new Date(Date.UTC(year, month - 1, day))
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	)
}

export function throwInvalidField(
	path: string,
	rule: ServiceValidationIssue["rule"],
	expected?: ServiceValidationIssue["expected"],
): never {
	const issue: ServiceValidationIssue = { path, rule }
	if (expected !== undefined) issue.expected = expected

	throw new PermitValidationError(permitValidationErrors.invalidPayload, {
		source: "service",
		issue,
	})
}
