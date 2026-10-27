import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { PermitFieldData } from "@shared"
import { getPermitDataHash, PERMIT_DATA_HASH_VERSION } from "./permit-data-hash"

const emptyPermitHash =
	"5dfb6042c43bfe174f490be4a50acceb3754af73347d683559fa0e09a24ed56c"
const completePermitHash =
	"a754642e917d4b88c78a36984c88c3438691eca8adeda0ac3629e5ae5887eedc"

describe("permit data hash", () => {
	it("uses the first hash version", () => {
		assert.equal(PERMIT_DATA_HASH_VERSION, 1)
	})

	it("has one stable hash for a permit with no collected data", () => {
		assert.equal(getPermitDataHash(null), emptyPermitHash)
	})

	it("has one stable hash for a complete permit", () => {
		assert.equal(getPermitDataHash(makePermitData()), completePermitHash)
	})

	it("ignores JSON property order", () => {
		const data = makePermitData()
		const reorderedData: PermitFieldData = {
			dehearingDetails: data.dehearingDetails,
			groomingDetails: data.groomingDetails,
			cleaningCommonRecords: data.cleaningCommonRecords,
			cleaningHeader: data.cleaningHeader,
			shearingRecords: data.shearingRecords,
			shearingHeader: data.shearingHeader,
			participants: data.participants.map((participant) => ({
				notes: participant.notes,
				signature: participant.signature,
				identityNumber: participant.identityNumber,
				gender: participant.gender,
				lastNames: participant.lastNames,
				name: participant.name,
				permitId: participant.permitId,
				id: participant.id,
			})),
		}

		assert.equal(getPermitDataHash(reorderedData), getPermitDataHash(data))
	})

	it("ignores participant order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.participants.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("ignores shearing-record order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.shearingRecords.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("ignores cleaning-record order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.cleaningCommonRecords.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("ignores grooming-detail order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.groomingDetails.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("ignores dehearing-detail order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.dehearingDetails.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("ignores external-parasite order", () => {
		const originalData = makePermitData()
		const reorderedData = structuredClone(originalData)
		reorderedData.shearingRecords[0].externalParasites.reverse()

		assert.equal(
			getPermitDataHash(reorderedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when participant data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.participants[0] = {
			id: "participant-c",
			permitId: "permit-2",
			name: "Elena",
			lastNames: "Mamani",
			gender: "M",
			identityNumber: "999999",
			signature: "changed-signature",
			notes: "Changed notes",
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when shearing-header data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.shearingHeader = {
			id: "shearing-header-2",
			permitId: "permit-2",
			site: "Corral sur",
			latitude: -20,
			longitude: -66,
			roundupCount: 3,
			eventDate: "16/10/2026",
			startTime: "09:00",
			endTime: "12:00",
			isCompleted: false,
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when shearing-record data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.shearingRecords[0] = {
			id: "shearing-c",
			permitId: "permit-2",
			tagNumber: 3,
			sex: "M",
			ageCategory: "Juvenil",
			liveWeight: 49,
			fiberLength: 9,
			bodyCondition: "Regular",
			gestationStatus: "Si",
			externalParasites: ["Garrapata"],
			mangeSeverity: "Leve",
			hasDandruff: true,
			isSheared: false,
			isDead: true,
			observations: "Changed observation",
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when cleaning-header data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.cleaningHeader = {
			id: "cleaning-header-2",
			permitId: "permit-2",
			startDate: "17/10/2026",
			endDate: "18/10/2026",
			site: "Galpón secundario",
			supervisors: "Elena y Juan",
			isCompleted: false,
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when cleaning-record data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.cleaningCommonRecords[0] = {
			id: "cleaning-c",
			permitId: "permit-2",
			fleeceNumber: "3",
			grossWeight: 3,
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when grooming data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.groomingDetails[0] = {
			id: "grooming-c",
			cleaningCommonId: "cleaning-c",
			cleanWeight: 1.6,
			dirtyWeight: 0.6,
			totalWeight: 2.1,
			isCompleted: false,
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when dehearing data changes", () => {
		const originalData = makePermitData()
		const changedData = structuredClone(originalData)
		changedData.dehearingDetails[0] = {
			id: "dehearing-c",
			cleaningCommonId: "cleaning-c",
			dehairedWeight: 1.2,
			bristleWeight: 0.4,
			hasDandruff: false,
			dehairerName: "Teresa",
			signature: "changed-signature",
			isCompleted: false,
		}

		assert.notEqual(
			getPermitDataHash(changedData),
			getPermitDataHash(originalData),
		)
	})

	it("changes when a record is added or deleted", () => {
		const originalData = makePermitData()
		const addedData = structuredClone(originalData)
		const deletedData = structuredClone(originalData)
		addedData.participants.push({
			...addedData.participants[0],
			id: "participant-c",
		})
		deletedData.participants.pop()

		assert.notEqual(
			getPermitDataHash(addedData),
			getPermitDataHash(originalData),
		)
		assert.notEqual(
			getPermitDataHash(deletedData),
			getPermitDataHash(originalData),
		)
	})

	it("does not modify the data while hashing it", () => {
		const data = makePermitData()
		const originalData = structuredClone(data)

		getPermitDataHash(data)

		assert.deepEqual(data, originalData)
	})
})

function makePermitData(): PermitFieldData {
	return {
		participants: [
			{
				id: "participant-b",
				permitId: "permit-1",
				name: "Lucía",
				lastNames: "Choque",
				gender: "F",
				identityNumber: "123456",
				signature: "signature-b",
				notes: "Second participant",
			},
			{
				id: "participant-a",
				permitId: "permit-1",
				name: "Rosa",
				lastNames: "Condori",
				gender: "F",
				identityNumber: "654321",
				signature: "signature-a",
				notes: "First participant",
			},
		],
		shearingHeader: {
			id: "shearing-header-1",
			permitId: "permit-1",
			site: "Corral norte",
			latitude: -19.5,
			longitude: -65.75,
			roundupCount: 2,
			eventDate: "15/10/2026",
			startTime: "08:30",
			endTime: "11:45",
			isCompleted: true,
		},
		shearingRecords: [
			makeShearingRecord("shearing-b", 2),
			makeShearingRecord("shearing-a", 1),
		],
		cleaningHeader: {
			id: "cleaning-header-1",
			permitId: "permit-1",
			startDate: "16/10/2026",
			endDate: "17/10/2026",
			site: "Galpón principal",
			supervisors: "Ana y Pedro",
			isCompleted: true,
		},
		cleaningCommonRecords: [
			{
				id: "cleaning-b",
				permitId: "permit-1",
				fleeceNumber: "2",
				grossWeight: 2.4,
			},
			{
				id: "cleaning-a",
				permitId: "permit-1",
				fleeceNumber: "1",
				grossWeight: 2.1,
			},
		],
		groomingDetails: [
			{
				id: "grooming-b",
				cleaningCommonId: "cleaning-b",
				cleanWeight: 1.5,
				dirtyWeight: 0.5,
				totalWeight: 2,
				isCompleted: true,
			},
			{
				id: "grooming-a",
				cleaningCommonId: "cleaning-a",
				cleanWeight: 1.2,
				dirtyWeight: 0.4,
				totalWeight: 1.6,
				isCompleted: true,
			},
		],
		dehearingDetails: [
			{
				id: "dehearing-b",
				cleaningCommonId: "cleaning-b",
				dehairedWeight: 1.1,
				bristleWeight: 0.3,
				hasDandruff: true,
				dehairerName: "María",
				signature: "dehairer-signature-b",
				isCompleted: true,
			},
			{
				id: "dehearing-a",
				cleaningCommonId: "cleaning-a",
				dehairedWeight: 1,
				bristleWeight: 0.2,
				hasDandruff: false,
				dehairerName: "Juana",
				signature: "dehairer-signature-a",
				isCompleted: true,
			},
		],
	}
}

function makeShearingRecord(id: string, tagNumber: number) {
	return {
		id,
		permitId: "permit-1",
		tagNumber,
		sex: "F" as const,
		ageCategory: "Adulto" as const,
		liveWeight: 48.5,
		fiberLength: 8.2,
		bodyCondition: "Bueno" as const,
		gestationStatus: "No" as const,
		externalParasites: ["Piojos", "Garrapata"] as Array<
			"Piojos" | "Garrapata"
		>,
		mangeSeverity: "Ninguna" as const,
		hasDandruff: false,
		isSheared: true,
		isDead: false,
		observations: `Observation ${tagNumber}`,
	}
}
