const Decimal = require("decimal.js");
const sharedErrors = require("./errors.json");
const { parsePermitDataShape } = require("./permit-data-schema.js");

const MAX_TAG_NUMBER = 2_147_483_647;
const MAX_ROUNDUP_COUNT = 100;
const MAX_LIVE_WEIGHT = 100;
const MAX_FIBER_LENGTH = 15;
const MAX_FIBER_WEIGHT = 4_000;
const CALENDAR_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const POSITIVE_INTEGER_TEXT_PATTERN = /^\d+$/;

// ==========================================
// PUBLIC VALIDATION
// ==========================================

class PermitDataValidationError extends Error {
	constructor(definition, details) {
		super(definition.message);
		this.name = "PermitDataValidationError";
		this.code = definition.code;
		this.details = details;
	}
}

function parseCompletePermitData(value, permitId) {
	const result = parsePermitDataShape(value);
	if (!result.success) {
		throwValidationError("invalidPayload", {
			source: "zod",
			issues: result.error.issues,
		});
	}

	validateNonBlankText(permitId, "permitId");
	validateParticipants(result.data, permitId);
	validateShearing(result.data, permitId);
	validateCleaning(result.data, permitId);

	return result.data;
}

// ==========================================
// PARTICIPANTS
// ==========================================

function validateParticipants(data, permitId) {
	if (!data.participants.length) {
		throwValidationError("participantsMissing");
	}

	for (const [index, participant] of data.participants.entries()) {
		const path = `participants.${index}`;
		validateNonBlankText(participant.id, `${path}.id`);
		validateNonBlankText(participant.permitId, `${path}.permitId`);
		validateNonBlankText(participant.name, `${path}.name`);
		validateNonBlankText(participant.lastNames, `${path}.lastNames`);
		validatePositiveIntegerText(
			participant.identityNumber,
			`${path}.identityNumber`,
		);
		validateNonBlankText(participant.signature, `${path}.signature`);

		if (participant.permitId !== permitId) {
			throwValidationError("participantPermit");
		}
	}

	ensureUniqueIds(
		data.participants.map((participant) => participant.id),
		"participantDuplicate",
	);
}

// ==========================================
// SHEARING
// ==========================================

function validateShearing(data, permitId) {
	validateNonBlankText(data.shearingHeader.id, "shearingHeader.id");
	validateNonBlankText(data.shearingHeader.permitId, "shearingHeader.permitId");
	validateNonBlankText(data.shearingHeader.site, "shearingHeader.site");
	validateNumberInRange(
		data.shearingHeader.latitude,
		-90,
		90,
		"shearingHeader.latitude",
	);
	validateNumberInRange(
		data.shearingHeader.longitude,
		-180,
		180,
		"shearingHeader.longitude",
	);
	validatePositiveInteger(
		data.shearingHeader.roundupCount,
		MAX_ROUNDUP_COUNT,
		"shearingHeader.roundupCount",
	);
	validateCalendarDate(
		data.shearingHeader.eventDate,
		"shearingHeader.eventDate",
	);
	validateTime(data.shearingHeader.startTime, "shearingHeader.startTime");
	validateTime(data.shearingHeader.endTime, "shearingHeader.endTime");
	if (
		getTimeInMinutes(data.shearingHeader.endTime) <=
		getTimeInMinutes(data.shearingHeader.startTime)
	) {
		throwInvalidField(
			"shearingHeader.endTime",
			"after",
			"shearingHeader.startTime",
		);
	}

	if (data.shearingHeader.permitId !== permitId) {
		throwValidationError("shearingHeaderPermit");
	}
	if (!data.shearingHeader.isCompleted) {
		throwValidationError("shearingIncomplete");
	}
	if (!data.shearingRecords.length) {
		throwValidationError("shearingRecordsMissing");
	}

	for (const [index, record] of data.shearingRecords.entries()) {
		const path = `shearingRecords.${index}`;
		validateNonBlankText(record.id, `${path}.id`);
		validateNonBlankText(record.permitId, `${path}.permitId`);
		validatePositiveInteger(
			record.tagNumber,
			MAX_TAG_NUMBER,
			`${path}.tagNumber`,
		);
		validatePositiveNumber(
			record.liveWeight,
			MAX_LIVE_WEIGHT,
			`${path}.liveWeight`,
		);
		validatePositiveNumber(
			record.fiberLength,
			MAX_FIBER_LENGTH,
			`${path}.fiberLength`,
		);

		if (record.externalParasites.length > 2) {
			throwInvalidField(`${path}.externalParasites`, "maximum_items", 2);
		}
		if (
			new Set(record.externalParasites).size !== record.externalParasites.length
		) {
			throwInvalidField(`${path}.externalParasites`, "unique_items");
		}
		if (record.permitId !== permitId) {
			throwValidationError("shearingRecordPermit");
		}

		validateShearingRecordRules(record);
	}

	ensureUniqueIds(
		data.shearingRecords.map((record) => record.id),
		"shearingRecordDuplicate",
	);
}

function validateShearingRecordRules(record) {
	const gestationAllowed =
		record.sex === "F" && record.ageCategory === "Adulto";
	if (!gestationAllowed && record.gestationStatus !== "No") {
		throwValidationError("gestation");
	}

	const shouldBeSheared =
		record.ageCategory !== "Cria" && record.gestationStatus !== "Si";
	if (record.isSheared !== shouldBeSheared) {
		throwValidationError("sheared");
	}
}

// ==========================================
// CLEANING
// ==========================================

function validateCleaning(data, permitId) {
	validateNonBlankText(data.cleaningHeader.id, "cleaningHeader.id");
	validateNonBlankText(data.cleaningHeader.permitId, "cleaningHeader.permitId");
	validateCalendarDate(
		data.cleaningHeader.startDate,
		"cleaningHeader.startDate",
	);
	validateCalendarDate(data.cleaningHeader.endDate, "cleaningHeader.endDate");
	validateNonBlankText(data.cleaningHeader.site, "cleaningHeader.site");
	validateNonBlankText(
		data.cleaningHeader.supervisors,
		"cleaningHeader.supervisors",
	);

	if (data.cleaningHeader.permitId !== permitId) {
		throwValidationError("cleaningHeaderPermit");
	}
	if (!data.cleaningHeader.isCompleted) {
		throwValidationError("cleaningHeaderIncomplete");
	}
	if (!data.cleaningCommonRecords.length) {
		throwValidationError("cleaningRecordsMissing");
	}
	if (
		data.groomingDetails.length + data.dehearingDetails.length !==
		data.cleaningCommonRecords.length
	) {
		throwValidationError("cleaningDetailCount");
	}
	if (
		data.groomingDetails.some((detail) => !detail.isCompleted) ||
		data.dehearingDetails.some((detail) => !detail.isCompleted)
	) {
		throwValidationError("cleaningDetailIncomplete");
	}

	for (const [index, record] of data.cleaningCommonRecords.entries()) {
		const path = `cleaningCommonRecords.${index}`;
		validateNonBlankText(record.id, `${path}.id`);
		validateNonBlankText(record.permitId, `${path}.permitId`);
		validatePositiveIntegerText(record.fleeceNumber, `${path}.fleeceNumber`);
		validatePositiveNumber(
			record.grossWeight,
			MAX_FIBER_WEIGHT,
			`${path}.grossWeight`,
		);

		if (record.permitId !== permitId) {
			throwValidationError("cleaningRecordPermit");
		}
	}

	for (const [index, detail] of data.groomingDetails.entries()) {
		const path = `groomingDetails.${index}`;
		validateNonBlankText(detail.id, `${path}.id`);
		validateNonBlankText(detail.cleaningCommonId, `${path}.cleaningCommonId`);
		validatePositiveNumber(
			detail.cleanWeight,
			MAX_FIBER_WEIGHT,
			`${path}.cleanWeight`,
		);
		validatePositiveNumber(
			detail.dirtyWeight,
			MAX_FIBER_WEIGHT,
			`${path}.dirtyWeight`,
		);
		validatePositiveNumber(
			detail.totalWeight,
			undefined,
			`${path}.totalWeight`,
		);
	}

	for (const [index, detail] of data.dehearingDetails.entries()) {
		const path = `dehearingDetails.${index}`;
		validateNonBlankText(detail.id, `${path}.id`);
		validateNonBlankText(detail.cleaningCommonId, `${path}.cleaningCommonId`);
		validatePositiveNumber(
			detail.dehairedWeight,
			MAX_FIBER_WEIGHT,
			`${path}.dehairedWeight`,
		);
		validatePositiveNumber(
			detail.bristleWeight,
			MAX_FIBER_WEIGHT,
			`${path}.bristleWeight`,
		);
		validateNonBlankText(detail.dehairerName, `${path}.dehairerName`);
		validateNonBlankText(detail.signature, `${path}.signature`);
	}

	ensureUniqueIds(
		data.cleaningCommonRecords.map((record) => record.id),
		"cleaningRecordDuplicate",
	);
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.cleaningCommonId),
		"groomingRelationDuplicate",
	);
	ensureUniqueIds(
		data.groomingDetails.map((detail) => detail.id),
		"groomingDetailDuplicate",
	);
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.cleaningCommonId),
		"dehearingRelationDuplicate",
	);
	ensureUniqueIds(
		data.dehearingDetails.map((detail) => detail.id),
		"dehearingDetailDuplicate",
	);

	const cleaningRecordsById = new Map(
		data.cleaningCommonRecords.map((record) => [record.id, record]),
	);
	const usedDetailIds = new Set();

	for (const detail of data.groomingDetails) {
		const commonRecord = cleaningRecordsById.get(detail.cleaningCommonId);
		if (!commonRecord) throwValidationError("groomingPermit");

		validateGroomingWeights(commonRecord, detail);
		usedDetailIds.add(detail.cleaningCommonId);
	}

	for (const detail of data.dehearingDetails) {
		if (!cleaningRecordsById.has(detail.cleaningCommonId)) {
			throwValidationError("dehearingPermit");
		}
		if (usedDetailIds.has(detail.cleaningCommonId)) {
			throwValidationError("bothDetails");
		}
	}
}

function validateGroomingWeights(commonRecord, detail) {
	const grossWeight = new Decimal(commonRecord.grossWeight);
	const cleanWeight = new Decimal(detail.cleanWeight);
	const dirtyWeight = new Decimal(detail.dirtyWeight);
	const calculatedTotal = cleanWeight.plus(dirtyWeight);

	if (cleanWeight.greaterThan(grossWeight)) {
		throwValidationError("cleanWeight");
	}
	if (dirtyWeight.greaterThan(grossWeight)) {
		throwValidationError("dirtyWeight");
	}
	if (calculatedTotal.greaterThan(grossWeight)) {
		throwValidationError("totalWeight");
	}
	if (!calculatedTotal.equals(detail.totalWeight)) {
		throwValidationError("calculatedWeight");
	}
}

// ==========================================
// HELPERS
// ==========================================

function validateNonBlankText(value, path) {
	if (!value.trim()) throwInvalidField(path, "non_blank");
}

function validatePositiveIntegerText(value, path) {
	if (!POSITIVE_INTEGER_TEXT_PATTERN.test(value) || !/[1-9]/.test(value)) {
		throwInvalidField(path, "positive_integer");
	}
}

function validatePositiveInteger(value, max, path) {
	if (!Number.isSafeInteger(value) || value <= 0) {
		throwInvalidField(path, "positive_integer");
	}
	if (value > max) throwInvalidField(path, "maximum", max);
}

function validatePositiveNumber(value, max, path) {
	if (!Number.isFinite(value)) throwInvalidField(path, "finite_number");
	if (value <= 0) throwInvalidField(path, "positive");
	if (max !== undefined && value > max) {
		throwInvalidField(path, "maximum", max);
	}
}

function validateNumberInRange(value, min, max, path) {
	if (!Number.isFinite(value)) throwInvalidField(path, "finite_number");
	if (value < min || value > max) {
		throwInvalidField(path, "range", { min, max });
	}
}

function validateCalendarDate(value, path) {
	if (!CALENDAR_DATE_PATTERN.test(value)) {
		throwInvalidField(path, "date_format", "DD/MM/YYYY");
	}

	const [day, month, year] = value.split("/").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		throwInvalidField(path, "valid_date");
	}
}

function validateTime(value, path) {
	if (!TIME_PATTERN.test(value)) {
		throwInvalidField(path, "time_format", "HH:mm");
	}

	const [hours, minutes] = value.split(":").map(Number);
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		throwInvalidField(path, "valid_time");
	}
}

function getTimeInMinutes(value) {
	const [hours, minutes] = value.split(":").map(Number);
	return hours * 60 + minutes;
}

function ensureUniqueIds(ids, errorName) {
	if (new Set(ids).size !== ids.length) throwValidationError(errorName);
}

function throwInvalidField(path, rule, expected) {
	const issue = { path, rule };
	if (expected !== undefined) issue.expected = expected;
	throwValidationError("invalidPayload", { source: "service", issue });
}

function throwValidationError(errorName, details) {
	const definition = sharedErrors.permitValidationErrors[errorName];
	if (!definition)
		throw new Error(`Unknown permit validation error: ${errorName}`);
	throw new PermitDataValidationError(definition, details);
}

module.exports = {
	PermitDataValidationError,
	parseCompletePermitData,
};
