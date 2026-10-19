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

describe("complete permit data shape", () => {
	it("accepts a complete permit", () => {
		const data = makeCompletePermitData();

		assert.deepEqual(parseCompletePermitData(data, permitId), data);
	});

	for (const [name, change] of [
		["missing sections", (data) => delete data.participants],
		["unexpected sections", (data) => (data.extra = true)],
		["unexpected record fields", (data) => (data.participants[0].extra = true)],
		["wrong field types", (data) => (data.shearingHeader.latitude = "-19.5")],
		["invalid enum values", (data) => (data.participants[0].gender = "X")],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, "PYLD");
		});
	}

	it("requires a non-blank permit ID", () => {
		assertValidationCode(makeCompletePermitData(), "PYLD", "   ");
	});
});

function assertValidationCode(data, expectedCode, expectedPermitId = permitId) {
	assert.throws(
		() => parseCompletePermitData(data, expectedPermitId),
		(error) =>
			error instanceof PermitDataValidationError && error.code === expectedCode,
	);
}
