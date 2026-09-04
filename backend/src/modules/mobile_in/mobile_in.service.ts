import Decimal from "decimal.js"
import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import {
	PermitValidationError,
	permitValidationErrors,
} from "./mobile_in.errors"
import {
	getLoggedValidationIssues,
	getPayloadPermitIdForLog,
	parseSyncPayload,
} from "./mobile_in.payload"
import { saveSyncFieldData } from "./mobile_in.repository"
import type {
	CleaningCommonData,
	GroomingData,
	ShearingRecordData,
	SyncFieldData,
} from "./mobile_in.types"

export async function submitSyncFieldData(
	payload: unknown,
	authorizationHeader: string,
) {
	const user = await getMobileUserFromAuthorization(authorizationHeader)

	try {
		const data = parseSyncPayload(payload)
		validatePermit(data)
		validateParticipants(data)
		validateShearing(data)
		validateCleaning(data)

		return saveSyncFieldData(data, user.id)
	} catch (error) {
		if (error instanceof PermitValidationError) {
			console.error("Mobile sync payload validation failed", {
				at: new Date().toISOString(),
				userId: user.id,
				permitId: getPayloadPermitIdForLog(payload),
				code: error.code,
				message: error.message,
				issues: getLoggedValidationIssues(error.issues),
			})
		}

		throw error
	}
}

function validatePermit(data: SyncFieldData): void {
	if (!data.permit.id) {
		throw new PermitValidationError(permitValidationErrors.permitId)
	}

	if (
		data.expectedSyncVersion !== null &&
		(!Number.isInteger(data.expectedSyncVersion) ||
			data.expectedSyncVersion < 1)
	) {
		throw new PermitValidationError(permitValidationErrors.permitVersion)
	}
}

function validateParticipants(data: SyncFieldData): void {
	if (!data.participants.length) {
		throw new PermitValidationError(
			permitValidationErrors.participantsMissing,
		)
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		permitValidationErrors.participantDuplicate,
	)

	for (const participant of data.participants) {
		if (participant.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.participantPermit,
			)
		}
	}
}

function validateShearing(data: SyncFieldData): void {
	if (!data.shearingHeader) {
		throw new PermitValidationError(
			permitValidationErrors.shearingHeaderMissing,
		)
	}

	if (data.shearingHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			permitValidationErrors.shearingHeaderPermit,
		)
	}

	if (!data.shearingRecords.length) {
		throw new PermitValidationError(
			permitValidationErrors.shearingRecordsMissing,
		)
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		permitValidationErrors.shearingRecordDuplicate,
	)

	for (const record of data.shearingRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.shearingRecordPermit,
			)
		}

		validateShearingRecordRules(record)
	}
}

function validateShearingRecordRules(record: ShearingRecordData): void {
	const gestationAllowed =
		record.sex === "F" && record.ageCategory === "Adulto"
	if (!gestationAllowed && record.gestationStatus !== "No") {
		throw new PermitValidationError(permitValidationErrors.gestation)
	}

	const shouldBeSheared =
		record.ageCategory !== "Cria" && record.gestationStatus !== "Si"
	if (record.isSheared !== shouldBeSheared) {
		throw new PermitValidationError(permitValidationErrors.sheared)
	}
}

function validateCleaning(data: SyncFieldData): void {
	if (!data.cleaningHeader) {
		throw new PermitValidationError(
			permitValidationErrors.cleaningHeaderMissing,
		)
	}

	if (data.cleaningHeader.permitId !== data.permit.id) {
		throw new PermitValidationError(
			permitValidationErrors.cleaningHeaderPermit,
		)
	}

	if (!data.cleaningCommonRecords.length) {
		throw new PermitValidationError(
			permitValidationErrors.cleaningRecordsMissing,
		)
	}

	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throw new PermitValidationError(
			permitValidationErrors.cleaningDetailCount,
		)
	}

	ensureUniqueIds(
		data.cleaningCommonRecords.map((record) => record.id),
		permitValidationErrors.cleaningRecordDuplicate,
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.cleaningCommonId),
		permitValidationErrors.groomingRelationDuplicate,
	)
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.id),
		permitValidationErrors.groomingDetailDuplicate,
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.cleaningCommonId),
		permitValidationErrors.dehearingRelationDuplicate,
	)
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.id),
		permitValidationErrors.dehearingDetailDuplicate,
	)

	for (const record of data.cleaningCommonRecords) {
		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.cleaningRecordPermit,
			)
		}
		if (!isPositiveFiniteNumber(record.grossWeight)) {
			throw new PermitValidationError(permitValidationErrors.grossWeight)
		}
	}

	const cleaningRecordsById = new Map(
		data.cleaningCommonRecords.map((record) => [record.id, record]),
	)
	const usedDetailIds = new Set<string>()

	for (const detail of data.groomingDetails) {
		const commonRecord = cleaningRecordsById.get(detail.cleaningCommonId)

		if (!commonRecord) {
			throw new PermitValidationError(
				permitValidationErrors.groomingPermit,
			)
		}

		validateGroomingWeights(commonRecord, detail)
		usedDetailIds.add(detail.cleaningCommonId)
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningRecordsById.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(
				permitValidationErrors.dehearingPermit,
			)
		}

		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throw new PermitValidationError(permitValidationErrors.bothDetails)
		}
	}
}

function validateGroomingWeights(
	commonRecord: CleaningCommonData,
	detail: GroomingData,
): void {
	const { grossWeight } = commonRecord
	const { cleanWeight, dirtyWeight, totalWeight } = detail

	if (
		![cleanWeight, dirtyWeight, totalWeight].every(isPositiveFiniteNumber)
	) {
		throw new PermitValidationError(permitValidationErrors.groomingWeights)
	}

	const grossWeightDecimal = new Decimal(grossWeight)
	const cleanWeightDecimal = new Decimal(cleanWeight)
	const dirtyWeightDecimal = new Decimal(dirtyWeight)
	const calculatedTotal = cleanWeightDecimal.plus(dirtyWeightDecimal)

	if (cleanWeightDecimal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(permitValidationErrors.cleanWeight)
	}
	if (dirtyWeightDecimal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(permitValidationErrors.dirtyWeight)
	}
	if (calculatedTotal.greaterThan(grossWeightDecimal)) {
		throw new PermitValidationError(permitValidationErrors.totalWeight)
	}
	if (!calculatedTotal.equals(totalWeight)) {
		throw new PermitValidationError(permitValidationErrors.calculatedWeight)
	}
}

function isPositiveFiniteNumber(value: number): boolean {
	return Number.isFinite(value) && value > 0
}

function ensureUniqueIds(
	ids: string[],
	error: (typeof permitValidationErrors)[keyof typeof permitValidationErrors],
): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new PermitValidationError(error)
	}
}
