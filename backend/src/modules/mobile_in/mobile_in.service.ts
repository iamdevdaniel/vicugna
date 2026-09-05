import Decimal from "decimal.js"
import { getMobileUserFromAuthorization } from "../mobile-auth/mobile_auth.service"
import {
	PermitValidationError,
	permitValidationErrors,
} from "./mobile_in.errors"
import { getPayloadPermitIdForLog, parseSyncPayload } from "./mobile_in.payload"
import { saveSyncFieldData } from "./mobile_in.repository"
import type {
	CleaningCommonData,
	GroomingData,
	ShearingRecordData,
	SyncFieldData,
} from "./mobile_in.types"
import {
	getTimeInMinutes,
	throwInvalidField,
	validateCalendarDate,
	validateDateTimeWithOffset,
	validateNonBlankText,
	validateNumberInRange,
	validatePositiveInteger,
	validatePositiveIntegerText,
	validatePositiveNumber,
	validateTime,
} from "./mobile_in.validation"

const MAX_TAG_NUMBER = 2_147_483_647
const MAX_ROUNDUP_COUNT = 100
const MAX_LIVE_WEIGHT = 100
const MAX_FIBER_LENGTH = 15
const MAX_FIBER_WEIGHT = 4_000

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
				details: error.logDetails,
			})
		}

		throw error
	}
}

function validatePermit(data: SyncFieldData): void {
	validateNonBlankText(data.permit.id, "permit.id")
	validateNonBlankText(data.permit.permitNumber, "permit.permitNumber")
	validateNonBlankText(data.permit.seasonId, "permit.seasonId")
	validateNonBlankText(data.permit.seasonName, "permit.seasonName")
	validateNonBlankText(data.permit.communityId, "permit.communityId")
	validateNonBlankText(data.permit.regionalId, "permit.regionalId")
	validateNonBlankText(data.permit.departmentId, "permit.departmentId")
	validateNonBlankText(data.permit.userId, "permit.userId")
	validateNonBlankText(data.permit.userFullName, "permit.userFullName")

	if (
		data.expectedSyncVersion !== null &&
		(!Number.isSafeInteger(data.expectedSyncVersion) ||
			data.expectedSyncVersion < 1)
	) {
		throw new PermitValidationError(permitValidationErrors.permitVersion)
	}

	if (data.permit.syncedAt !== null) {
		validateDateTimeWithOffset(data.permit.syncedAt, "permit.syncedAt")
	}
}

function validateParticipants(data: SyncFieldData): void {
	if (!data.participants.length) {
		throw new PermitValidationError(
			permitValidationErrors.participantsMissing,
		)
	}

	for (const [index, participant] of data.participants.entries()) {
		const path = `participants.${index}`
		validateNonBlankText(participant.id, `${path}.id`)
		validateNonBlankText(participant.permitId, `${path}.permitId`)
		validateNonBlankText(participant.name, `${path}.name`)
		validateNonBlankText(participant.lastNames, `${path}.lastNames`)
		validatePositiveIntegerText(
			participant.identityNumber,
			`${path}.identityNumber`,
		)
		validateNonBlankText(participant.signature, `${path}.signature`)

		if (participant.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.participantPermit,
			)
		}
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		permitValidationErrors.participantDuplicate,
	)
}

function validateShearing(data: SyncFieldData): void {
	validateNonBlankText(data.shearingHeader.id, "shearingHeader.id")
	validateNonBlankText(
		data.shearingHeader.permitId,
		"shearingHeader.permitId",
	)
	validateNonBlankText(data.shearingHeader.site, "shearingHeader.site")
	validateNumberInRange(
		data.shearingHeader.latitude,
		-90,
		90,
		"shearingHeader.latitude",
	)
	validateNumberInRange(
		data.shearingHeader.longitude,
		-180,
		180,
		"shearingHeader.longitude",
	)
	validatePositiveInteger(
		data.shearingHeader.roundupCount,
		MAX_ROUNDUP_COUNT,
		"shearingHeader.roundupCount",
	)
	validateCalendarDate(
		data.shearingHeader.eventDate,
		"shearingHeader.eventDate",
	)
	validateTime(data.shearingHeader.startTime, "shearingHeader.startTime")
	validateTime(data.shearingHeader.endTime, "shearingHeader.endTime")
	if (
		getTimeInMinutes(data.shearingHeader.endTime) <=
		getTimeInMinutes(data.shearingHeader.startTime)
	) {
		throwInvalidField(
			"shearingHeader.endTime",
			"after",
			"shearingHeader.startTime",
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

	for (const [index, record] of data.shearingRecords.entries()) {
		const path = `shearingRecords.${index}`
		validateNonBlankText(record.id, `${path}.id`)
		validateNonBlankText(record.permitId, `${path}.permitId`)
		validatePositiveInteger(
			record.tagNumber,
			MAX_TAG_NUMBER,
			`${path}.tagNumber`,
		)
		validatePositiveNumber(
			record.liveWeight,
			MAX_LIVE_WEIGHT,
			`${path}.liveWeight`,
		)
		validatePositiveNumber(
			record.fiberLength,
			MAX_FIBER_LENGTH,
			`${path}.fiberLength`,
		)

		if (record.externalParasites.length > 2) {
			throwInvalidField(`${path}.externalParasites`, "maximum_items", 2)
		}
		if (
			new Set(record.externalParasites).size !==
			record.externalParasites.length
		) {
			throwInvalidField(`${path}.externalParasites`, "unique_items")
		}

		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.shearingRecordPermit,
			)
		}

		validateShearingRecordRules(record)
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		permitValidationErrors.shearingRecordDuplicate,
	)
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
	validateNonBlankText(data.cleaningHeader.id, "cleaningHeader.id")
	validateNonBlankText(
		data.cleaningHeader.permitId,
		"cleaningHeader.permitId",
	)
	validateCalendarDate(
		data.cleaningHeader.startDate,
		"cleaningHeader.startDate",
	)
	validateCalendarDate(data.cleaningHeader.endDate, "cleaningHeader.endDate")
	validateNonBlankText(data.cleaningHeader.site, "cleaningHeader.site")
	validateNonBlankText(
		data.cleaningHeader.supervisors,
		"cleaningHeader.supervisors",
	)

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

	for (const [index, record] of data.cleaningCommonRecords.entries()) {
		const path = `cleaningCommonRecords.${index}`
		validateNonBlankText(record.id, `${path}.id`)
		validateNonBlankText(record.permitId, `${path}.permitId`)
		validatePositiveIntegerText(record.fleeceNumber, `${path}.fleeceNumber`)
		validatePositiveNumber(
			record.grossWeight,
			MAX_FIBER_WEIGHT,
			`${path}.grossWeight`,
		)

		if (record.permitId !== data.permit.id) {
			throw new PermitValidationError(
				permitValidationErrors.cleaningRecordPermit,
			)
		}
	}

	for (const [index, detail] of data.groomingDetails.entries()) {
		const path = `groomingDetails.${index}`
		validateNonBlankText(detail.id, `${path}.id`)
		validateNonBlankText(
			detail.cleaningCommonId,
			`${path}.cleaningCommonId`,
		)
		validatePositiveNumber(
			detail.cleanWeight,
			MAX_FIBER_WEIGHT,
			`${path}.cleanWeight`,
		)
		validatePositiveNumber(
			detail.dirtyWeight,
			MAX_FIBER_WEIGHT,
			`${path}.dirtyWeight`,
		)
		validatePositiveNumber(
			detail.totalWeight,
			undefined,
			`${path}.totalWeight`,
		)
	}

	for (const [index, detail] of data.dehearingDetails.entries()) {
		const path = `dehearingDetails.${index}`
		validateNonBlankText(detail.id, `${path}.id`)
		validateNonBlankText(
			detail.cleaningCommonId,
			`${path}.cleaningCommonId`,
		)
		validatePositiveNumber(
			detail.dehairedWeight,
			MAX_FIBER_WEIGHT,
			`${path}.dehairedWeight`,
		)
		validatePositiveNumber(
			detail.bristleWeight,
			MAX_FIBER_WEIGHT,
			`${path}.bristleWeight`,
		)
		validateNonBlankText(detail.dehairerName, `${path}.dehairerName`)
		validateNonBlankText(detail.signature, `${path}.signature`)
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

function ensureUniqueIds(
	ids: string[],
	error: (typeof permitValidationErrors)[keyof typeof permitValidationErrors],
): void {
	const uniqueIds = new Set(ids)

	if (uniqueIds.size !== ids.length) {
		throw new PermitValidationError(error)
	}
}
