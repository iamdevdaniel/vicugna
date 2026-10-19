import {
	PermitDataValidationError,
	parseCompletePermitData,
} from "@shared/permit-data-validation"
import { z } from "zod"
import { PERMIT_DATA_HASH_VERSION } from "../permit-sync/permit-data-hash"
import {
	PermitSyncError,
	PermitValidationError,
	permitSyncErrors,
	permitValidationErrors,
} from "./mobile_in.errors"
import type { SyncFieldData } from "./mobile_in.types"

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const syncPayloadMetadataSchema = z
	.object({ hashVersion: z.number().int().positive() })
	.passthrough()
const syncPayloadSchema = z
	.object({
		permitId: z.string(),
		baseHash: z.string().regex(/^[0-9a-f]{64}$/),
		hashVersion: z.number().int().positive(),
		participants: z.unknown(),
		shearingHeader: z.unknown(),
		shearingRecords: z.unknown(),
		cleaningHeader: z.unknown(),
		cleaningCommonRecords: z.unknown(),
		groomingDetails: z.unknown(),
		dehearingDetails: z.unknown(),
	})
	.strict()

export function parseSyncPayload(payload: unknown): SyncFieldData {
	const metadataResult = syncPayloadMetadataSchema.safeParse(payload)
	if (!metadataResult.success) {
		throwInvalidPayload(metadataResult.error.issues)
	}
	if (metadataResult.data.hashVersion !== PERMIT_DATA_HASH_VERSION) {
		throw new PermitSyncError(permitSyncErrors.unsupportedHashVersion)
	}

	const result = syncPayloadSchema.safeParse(payload)
	if (!result.success) {
		throwInvalidPayload(result.error.issues)
	}

	try {
		const fieldData = parseCompletePermitData(
			{
				participants: result.data.participants,
				shearingHeader: result.data.shearingHeader,
				shearingRecords: result.data.shearingRecords,
				cleaningHeader: result.data.cleaningHeader,
				cleaningCommonRecords: result.data.cleaningCommonRecords,
				groomingDetails: result.data.groomingDetails,
				dehearingDetails: result.data.dehearingDetails,
			},
			result.data.permitId,
		)
		return {
			permitId: result.data.permitId,
			baseHash: result.data.baseHash,
			hashVersion: result.data.hashVersion,
			...fieldData,
		}
	} catch (error) {
		if (error instanceof PermitDataValidationError) {
			throw new PermitValidationError(
				{ code: error.code, message: error.message },
				error.details,
			)
		}
		throw error
	}
}

function throwInvalidPayload(issues: z.ZodIssue[]): never {
	throw new PermitValidationError(permitValidationErrors.invalidPayload, {
		source: "zod",
		issues,
	})
}

export function getPayloadPermitIdForLog(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") return null

	const id = (payload as { permitId?: unknown }).permitId

	return typeof id === "string" && UUID_PATTERN.test(id) ? id : null
}
