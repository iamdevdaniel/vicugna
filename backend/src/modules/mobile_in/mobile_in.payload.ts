import { z } from "zod"
import {
	PermitValidationError,
	type PermitValidationIssue,
	permitValidationErrors,
} from "./mobile_in.errors"
import type { SyncFieldData } from "./mobile_in.types"

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_LOGGED_ISSUES = 10
const MAX_LOGGED_ISSUE_TEXT_LENGTH = 200
const nonBlankText = z.string().refine((value) => value.trim().length > 0)
const identifier = nonBlankText
const positiveNumber = z.number().finite().positive()
const positiveInteger = z.number().int().safe().positive()
const calendarDate = z
	.string()
	.regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
	.refine((value) => {
		const [day, month, year] = value.split("/").map(Number)
		const date = new Date(Date.UTC(year, month - 1, day))

		return (
			date.getUTCFullYear() === year &&
			date.getUTCMonth() === month - 1 &&
			date.getUTCDate() === day
		)
	})
const time = z
	.string()
	.regex(/^\d{2}:\d{2}$/)
	.refine((value) => {
		const [hours, minutes] = value.split(":").map(Number)

		return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
	})
const positiveIntegerText = z
	.string()
	.refine((value) => /^\d+$/.test(value) && BigInt(value) > 0n)

const permitSchema = z
	.object({
		id: identifier,
		permitNumber: nonBlankText,
		seasonId: identifier,
		seasonName: nonBlankText,
		communityId: identifier,
		regionalId: identifier,
		departmentId: identifier,
		userId: identifier,
		userFullName: nonBlankText,
		isActiveAssignmentUser: z.boolean(),
		syncStatus: z.enum([
			"created",
			"assigned",
			"in_progress",
			"synced",
			"reopened",
		]),
		syncedAt: z.string().datetime({ offset: true }).nullable(),
	})
	.strict()

const participantSchema = z
	.object({
		id: identifier,
		permitId: identifier,
		name: nonBlankText,
		lastNames: nonBlankText,
		gender: z.enum(["M", "F"]),
		identityNumber: positiveIntegerText,
		signature: nonBlankText,
		notes: z.string(),
	})
	.strict()

const shearingHeaderSchema = z
	.object({
		id: identifier,
		permitId: identifier,
		site: nonBlankText,
		latitude: z.number().finite().min(-90).max(90),
		longitude: z.number().finite().min(-180).max(180),
		roundupCount: positiveInteger,
		eventDate: calendarDate,
		startTime: time,
		endTime: time,
		isCompleted: z.boolean(),
	})
	.strict()

const shearingRecordSchema = z
	.object({
		id: identifier,
		permitId: identifier,
		tagNumber: positiveInteger,
		sex: z.enum(["F", "M"]),
		ageCategory: z.enum(["Cria", "Juvenil", "Adulto"]),
		liveWeight: positiveNumber,
		fiberLength: positiveNumber,
		bodyCondition: z.enum(["Malo", "Regular", "Bueno"]),
		gestationStatus: z.enum(["No", "Si", "Si ultimo tercio"]),
		externalParasites: z
			.array(z.enum(["Garrapata", "Piojos"]))
			.max(2)
			.refine((values) => new Set(values).size === values.length),
		mangeSeverity: z.enum(["Ninguna", "Leve", "Moderado", "Severo"]),
		hasDandruff: z.boolean(),
		isSheared: z.boolean(),
		isDead: z.boolean(),
		observations: z.string(),
	})
	.strict()

const cleaningHeaderSchema = z
	.object({
		id: identifier,
		permitId: identifier,
		startDate: calendarDate,
		endDate: calendarDate,
		site: nonBlankText,
		supervisors: nonBlankText,
		isCompleted: z.boolean(),
	})
	.strict()

const cleaningCommonSchema = z
	.object({
		id: identifier,
		permitId: identifier,
		fleeceNumber: positiveIntegerText,
		grossWeight: positiveNumber,
	})
	.strict()

const groomingSchema = z
	.object({
		id: identifier,
		cleaningCommonId: identifier,
		cleanWeight: positiveNumber,
		dirtyWeight: positiveNumber,
		totalWeight: positiveNumber,
		isCompleted: z.boolean(),
	})
	.strict()

const dehearingSchema = z
	.object({
		id: identifier,
		cleaningCommonId: identifier,
		dehairedWeight: positiveNumber,
		bristleWeight: positiveNumber,
		hasDandruff: z.boolean(),
		dehairerName: nonBlankText,
		signature: nonBlankText,
		isCompleted: z.boolean(),
	})
	.strict()

const syncPayloadSchema = z
	.object({
		expectedSyncVersion: z.number().int().safe().positive().nullable(),
		permit: permitSchema,
		participants: z.array(participantSchema),
		shearingHeader: shearingHeaderSchema,
		shearingRecords: z.array(shearingRecordSchema),
		cleaningHeader: cleaningHeaderSchema,
		cleaningCommonRecords: z.array(cleaningCommonSchema),
		groomingDetails: z.array(groomingSchema),
		dehearingDetails: z.array(dehearingSchema),
	})
	.strict()

export function parseSyncPayload(payload: unknown): SyncFieldData {
	const result = syncPayloadSchema.safeParse(payload)

	if (!result.success) {
		const issues = result.error.issues.map((issue) => ({
			path: issue.path.length ? issue.path.join(".") : "payload",
			code: issue.code,
			message: issue.message,
		}))

		throw new PermitValidationError(permitValidationErrors.parse, issues)
	}

	return result.data
}

export function getPayloadPermitIdForLog(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") return null

	const permit = (payload as { permit?: unknown }).permit

	if (!permit || typeof permit !== "object") return null

	const id = (permit as { id?: unknown }).id

	return typeof id === "string" && UUID_PATTERN.test(id) ? id : null
}

export function getLoggedValidationIssues(
	issues: PermitValidationIssue[],
): PermitValidationIssue[] {
	return issues.slice(0, MAX_LOGGED_ISSUES).map((issue) => ({
		path: issue.path.slice(0, MAX_LOGGED_ISSUE_TEXT_LENGTH),
		code: issue.code.slice(0, MAX_LOGGED_ISSUE_TEXT_LENGTH),
		message: issue.message.slice(0, MAX_LOGGED_ISSUE_TEXT_LENGTH),
	}))
}
