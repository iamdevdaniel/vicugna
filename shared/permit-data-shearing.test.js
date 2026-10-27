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

describe("shearing validation", () => {
	for (const [name, change, code] of [
		[
			"an incomplete header",
			(data) => (data.shearingHeader.isCompleted = false),
			"VSHE_1",
		],
		[
			"a header from another permit",
			(data) => (data.shearingHeader.permitId = "permit-2"),
			"VSHE_2",
		],
		["missing records", (data) => (data.shearingRecords = []), "VSHE_3"],
		[
			"a record from another permit",
			(data) => (data.shearingRecords[0].permitId = "permit-2"),
			"VSHE_4",
		],
		[
			"duplicate record IDs",
			(data) => data.shearingRecords.push({ ...data.shearingRecords[0] }),
			"VSHE_7",
		],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, code);
		});
	}

	for (const [name, change] of [
		["blank header ID", (data) => (data.shearingHeader.id = "")],
		["blank site", (data) => (data.shearingHeader.site = "")],
		["latitude below -90", (data) => (data.shearingHeader.latitude = -91)],
		["latitude above 90", (data) => (data.shearingHeader.latitude = 91)],
		["longitude below -180", (data) => (data.shearingHeader.longitude = -181)],
		["longitude above 180", (data) => (data.shearingHeader.longitude = 181)],
		["zero roundup count", (data) => (data.shearingHeader.roundupCount = 0)],
		[
			"fractional roundup count",
			(data) => (data.shearingHeader.roundupCount = 1.5),
		],
		[
			"roundup count above 100",
			(data) => (data.shearingHeader.roundupCount = 101),
		],
		[
			"invalid date format",
			(data) => (data.shearingHeader.eventDate = "2026-10-15"),
		],
		[
			"impossible date",
			(data) => (data.shearingHeader.eventDate = "31/02/2026"),
		],
		["invalid start time", (data) => (data.shearingHeader.startTime = "25:00")],
		["invalid end time", (data) => (data.shearingHeader.endTime = "10:60")],
		[
			"end time before start",
			(data) => (data.shearingHeader.endTime = "07:00"),
		],
		["blank record ID", (data) => (data.shearingRecords[0].id = "")],
		["zero tag number", (data) => (data.shearingRecords[0].tagNumber = 0)],
		[
			"fractional tag number",
			(data) => (data.shearingRecords[0].tagNumber = 1.5),
		],
		[
			"tag number above the database limit",
			(data) => (data.shearingRecords[0].tagNumber = 2_147_483_648),
		],
		["zero live weight", (data) => (data.shearingRecords[0].liveWeight = 0)],
		[
			"live weight above 100",
			(data) => (data.shearingRecords[0].liveWeight = 101),
		],
		["zero fiber length", (data) => (data.shearingRecords[0].fiberLength = 0)],
		[
			"fiber length above 15",
			(data) => (data.shearingRecords[0].fiberLength = 16),
		],
		[
			"duplicate parasites",
			(data) =>
				(data.shearingRecords[0].externalParasites = ["Piojos", "Piojos"]),
		],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, "PYLD");
		});
	}

	it("rejects more than two parasites with the exact limit error", () => {
		const data = makeCompletePermitData();
		data.shearingRecords[0].externalParasites = [
			"Piojos",
			"Garrapata",
			"Piojos",
		];

		let validationError;
		try {
			parseCompletePermitData(data, permitId);
		} catch (error) {
			validationError = error;
		}

		assert.ok(validationError instanceof PermitDataValidationError);
		assert.equal(validationError.code, "PYLD");
		assert.deepEqual(validationError.details, {
			source: "service",
			issue: {
				path: "shearingRecords.0.externalParasites",
				rule: "maximum_items",
				expected: 2,
			},
		});
	});

	for (const [name, sex, ageCategory, gestationStatus] of [
		["pregnant male", "M", "Adulto", "Si"],
		["pregnant juvenile", "F", "Juvenil", "Si"],
		["pregnant cria", "F", "Cria", "Si ultimo tercio"],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			Object.assign(data.shearingRecords[0], {
				sex,
				ageCategory,
				gestationStatus,
				isSheared: false,
			});

			assertValidationCode(data, "VSHE_5");
		});
	}

	for (const [name, changes] of [
		["a sheared cria", { ageCategory: "Cria", isSheared: true }],
		["a sheared pregnant adult", { gestationStatus: "Si", isSheared: true }],
		["an unsheared eligible animal", { isSheared: false }],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			Object.assign(data.shearingRecords[0], changes);

			assertValidationCode(data, "VSHE_6");
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
