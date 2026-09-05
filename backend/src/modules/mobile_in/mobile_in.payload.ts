import { z } from "zod"
import {
	PermitValidationError,
	permitValidationErrors,
} from "./mobile_in.errors"
import type { SyncFieldData } from "./mobile_in.types"

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const permitSchema = z
	.object({
		id: z.string(),
		permitNumber: z.string(),
		seasonId: z.string(),
		seasonName: z.string(),
		communityId: z.string(),
		regionalId: z.string(),
		departmentId: z.string(),
		userId: z.string(),
		userFullName: z.string(),
		isActiveAssignmentUser: z.boolean(),
		syncStatus: z.enum([
			"created",
			"assigned",
			"in_progress",
			"synced",
			"reopened",
		]),
		syncedAt: z.string().nullable(),
	})
	.strict()

const participantSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		name: z.string(),
		lastNames: z.string(),
		gender: z.enum(["M", "F"]),
		identityNumber: z.string(),
		signature: z.string(),
		notes: z.string(),
	})
	.strict()

const shearingHeaderSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		site: z.string(),
		latitude: z.number(),
		longitude: z.number(),
		roundupCount: z.number(),
		eventDate: z.string(),
		startTime: z.string(),
		endTime: z.string(),
		isCompleted: z.boolean(),
	})
	.strict()

const shearingRecordSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		tagNumber: z.number(),
		sex: z.enum(["F", "M"]),
		ageCategory: z.enum(["Cria", "Juvenil", "Adulto"]),
		liveWeight: z.number(),
		fiberLength: z.number(),
		bodyCondition: z.enum(["Malo", "Regular", "Bueno"]),
		gestationStatus: z.enum(["No", "Si", "Si ultimo tercio"]),
		externalParasites: z.array(z.enum(["Garrapata", "Piojos"])),
		mangeSeverity: z.enum(["Ninguna", "Leve", "Moderado", "Severo"]),
		hasDandruff: z.boolean(),
		isSheared: z.boolean(),
		isDead: z.boolean(),
		observations: z.string(),
	})
	.strict()

const cleaningHeaderSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		startDate: z.string(),
		endDate: z.string(),
		site: z.string(),
		supervisors: z.string(),
		isCompleted: z.boolean(),
	})
	.strict()

const cleaningCommonSchema = z
	.object({
		id: z.string(),
		permitId: z.string(),
		fleeceNumber: z.string(),
		grossWeight: z.number(),
	})
	.strict()

const groomingSchema = z
	.object({
		id: z.string(),
		cleaningCommonId: z.string(),
		cleanWeight: z.number(),
		dirtyWeight: z.number(),
		totalWeight: z.number(),
		isCompleted: z.boolean(),
	})
	.strict()

const dehearingSchema = z
	.object({
		id: z.string(),
		cleaningCommonId: z.string(),
		dehairedWeight: z.number(),
		bristleWeight: z.number(),
		hasDandruff: z.boolean(),
		dehairerName: z.string(),
		signature: z.string(),
		isCompleted: z.boolean(),
	})
	.strict()

const syncPayloadSchema = z
	.object({
		expectedSyncVersion: z.number().nullable(),
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
		throw new PermitValidationError(permitValidationErrors.invalidPayload, {
			source: "zod",
			issues: result.error.issues,
		})
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
