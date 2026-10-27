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

describe("fiber-record validation", () => {
	for (const [name, change, code] of [
		[
			"an incomplete header",
			(data) => (data.cleaningHeader.isCompleted = false),
			"VCLG_1",
		],
		[
			"a header from another permit",
			(data) => (data.cleaningHeader.permitId = "permit-2"),
			"VCLG_2",
		],
		[
			"missing fiber records",
			(data) => {
				data.cleaningCommonRecords = [];
				data.groomingDetails = [];
			},
			"VCLG_3",
		],
		["a missing detail", (data) => (data.groomingDetails = []), "VCLG_4"],
		[
			"a fiber record from another permit",
			(data) => (data.cleaningCommonRecords[0].permitId = "permit-2"),
			"VCLG_5",
		],
		[
			"an incomplete detail",
			(data) => (data.groomingDetails[0].isCompleted = false),
			"VCLG_6",
		],
		[
			"a limpiado detail without its fiber record",
			(data) => (data.groomingDetails[0].cleaningCommonId = "missing-record"),
			"VCLG_7",
		],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, code);
		});
	}

	it("rejects a predescerdado detail without its fiber record", () => {
		const data = makeCompletePermitData({ detailType: "dehearing" });
		data.dehearingDetails[0].cleaningCommonId = "missing-record";

		assertValidationCode(data, "VCLG_8");
	});

	it("rejects limpiado and predescerdado on the same fiber record", () => {
		const data = makeCompletePermitData();
		addSecondCleaningRecord(data);
		data.dehearingDetails.push({
			id: "dehearing-detail-2",
			cleaningCommonId: "cleaning-record-1",
			dehairedWeight: 1,
			bristleWeight: 0.5,
			hasDandruff: false,
			dehairerName: "María",
			signature: '["M20 50 L80 20 L140 50"]',
			isCompleted: true,
		});

		assertValidationCode(data, "VCLG_9");
	});

	for (const [name, field, value, code] of [
		["clean weight above gross weight", "cleanWeight", 2.1, "VCLG_11"],
		["dirty weight above gross weight", "dirtyWeight", 2.1, "VCLG_12"],
		["combined weight above gross weight", "dirtyWeight", 1.1, "VCLG_13"],
		["incorrect stored total", "totalWeight", 1.4, "VCLG_14"],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			data.groomingDetails[0][field] = value;

			assertValidationCode(data, code);
		});
	}

	it("rejects duplicate fiber-record IDs", () => {
		const data = makeCompletePermitData();
		data.cleaningCommonRecords.push({ ...data.cleaningCommonRecords[0] });
		data.groomingDetails.push({
			...data.groomingDetails[0],
			id: "grooming-detail-2",
		});

		assertValidationCode(data, "VCLG_15");
	});

	it("rejects duplicate limpiado relationships", () => {
		const data = makeCompletePermitData();
		addSecondCleaningRecord(data);
		data.groomingDetails.push({
			...data.groomingDetails[0],
			id: "grooming-detail-2",
		});

		assertValidationCode(data, "VCLG_16");
	});

	it("rejects duplicate limpiado detail IDs", () => {
		const data = makeCompletePermitData();
		addSecondCleaningRecord(data);
		data.groomingDetails.push({
			...data.groomingDetails[0],
			cleaningCommonId: "cleaning-record-2",
		});

		assertValidationCode(data, "VCLG_17");
	});

	it("rejects duplicate predescerdado relationships", () => {
		const data = makeCompletePermitData({ detailType: "dehearing" });
		addSecondCleaningRecord(data);
		data.dehearingDetails.push({
			...data.dehearingDetails[0],
			id: "dehearing-detail-2",
		});

		assertValidationCode(data, "VCLG_18");
	});

	it("rejects duplicate predescerdado detail IDs", () => {
		const data = makeCompletePermitData({ detailType: "dehearing" });
		addSecondCleaningRecord(data);
		data.dehearingDetails.push({
			...data.dehearingDetails[0],
			cleaningCommonId: "cleaning-record-2",
		});

		assertValidationCode(data, "VCLG_19");
	});

	for (const [name, change] of [
		["blank header ID", (data) => (data.cleaningHeader.id = "")],
		[
			"invalid start date",
			(data) => (data.cleaningHeader.startDate = "31/02/2026"),
		],
		[
			"invalid end date",
			(data) => (data.cleaningHeader.endDate = "2026-10-17"),
		],
		["blank site", (data) => (data.cleaningHeader.site = "")],
		["blank supervisors", (data) => (data.cleaningHeader.supervisors = "")],
		[
			"blank fiber-record ID",
			(data) => (data.cleaningCommonRecords[0].id = ""),
		],
		[
			"invalid fleece number",
			(data) => (data.cleaningCommonRecords[0].fleeceNumber = "0"),
		],
		[
			"zero gross weight",
			(data) => (data.cleaningCommonRecords[0].grossWeight = 0),
		],
		[
			"gross weight above 4000",
			(data) => (data.cleaningCommonRecords[0].grossWeight = 4001),
		],
		["blank detail ID", (data) => (data.groomingDetails[0].id = "")],
		["zero clean weight", (data) => (data.groomingDetails[0].cleanWeight = 0)],
		["zero dirty weight", (data) => (data.groomingDetails[0].dirtyWeight = 0)],
		["zero total weight", (data) => (data.groomingDetails[0].totalWeight = 0)],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData();
			change(data);

			assertValidationCode(data, "PYLD");
		});
	}

	for (const [name, change] of [
		["blank predescerdado ID", (detail) => (detail.id = "")],
		["zero dehaired weight", (detail) => (detail.dehairedWeight = 0)],
		["dehaired weight above 4000", (detail) => (detail.dehairedWeight = 4001)],
		["zero bristle weight", (detail) => (detail.bristleWeight = 0)],
		["bristle weight above 4000", (detail) => (detail.bristleWeight = 4001)],
		["blank dehairer name", (detail) => (detail.dehairerName = "")],
		["blank dehairer signature", (detail) => (detail.signature = "")],
	]) {
		it(`rejects ${name}`, () => {
			const data = makeCompletePermitData({ detailType: "dehearing" });
			change(data.dehearingDetails[0]);

			assertValidationCode(data, "PYLD");
		});
	}
});

function addSecondCleaningRecord(data) {
	data.cleaningCommonRecords.push({
		id: "cleaning-record-2",
		permitId,
		fleeceNumber: "2",
		grossWeight: 2,
	});
}

function assertValidationCode(data, expectedCode) {
	assert.throws(
		() => parseCompletePermitData(data, permitId),
		(error) =>
			error instanceof PermitDataValidationError && error.code === expectedCode,
	);
}
