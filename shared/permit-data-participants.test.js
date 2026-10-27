const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
	PermitDataValidationError,
	parseCompletePermitData,
} = require("./permit-data-validation.js");
const {
	makeCompletePermitData,
	permitId,
} = require("./permit-data-validation.fixture.js");

describe("participant validation", () => {
	for (const [name, change, code] of [
		["missing participants", (data) => (data.participants = []), "VPRT_1"],
		[
			"a participant from another permit",
			(data) => (data.participants[0].permitId = "permit-2"),
			"VPRT_2",
		],
		[
			"duplicate participant IDs",
			(data) => data.participants.push({ ...data.participants[0] }),
			"VPRT_3",
		],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, code);
		});
	}

	for (const field of ["id", "permitId", "name", "lastNames", "signature"]) {
		it(`requires a non-blank participant ${field}`, () => {
			const data = makeCompletePermitData();
			data.participants[0][field] = "   ";

			assertValidationCode(data, "PYLD");
		});
	}

	for (const identityNumber of ["", "0", "12A"]) {
		it(`rejects identity number ${JSON.stringify(identityNumber)}`, () => {
			const data = makeCompletePermitData();
			data.participants[0].identityNumber = identityNumber;

			assertValidationCode(data, "PYLD");
		});
	}
});

function assertValidationCode(data, expectedCode) {
	assert.throws(
		() => parseCompletePermitData(data, permitId),
		(error) =>
			error instanceof PermitDataValidationError && error.code === expectedCode,
	);
}
