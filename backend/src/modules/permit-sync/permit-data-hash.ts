import { createHash } from "node:crypto"
import type {
	CleaningCommonData,
	CleaningHeaderData,
	DehearingData,
	GroomingData,
	ParticipantData,
	PermitFieldData,
	ShearingHeaderData,
	ShearingRecordData,
} from "@shared"

export const PERMIT_DATA_HASH_VERSION = 1

type CanonicalPermitData = Omit<
	PermitFieldData,
	"shearingHeader" | "cleaningHeader"
> & {
	shearingHeader: ShearingHeaderData | null
	cleaningHeader: CleaningHeaderData | null
}

export function getPermitDataHash(data: PermitFieldData | null): string {
	const canonicalData = getCanonicalPermitData(data)

	return createHash("sha256")
		.update(JSON.stringify(canonicalData))
		.digest("hex")
}

function getCanonicalPermitData(
	data: PermitFieldData | null,
): CanonicalPermitData {
	if (!data) {
		return {
			participants: [],
			shearingHeader: null,
			shearingRecords: [],
			cleaningHeader: null,
			cleaningCommonRecords: [],
			groomingDetails: [],
			dehearingDetails: [],
		}
	}

	return {
		participants: data.participants
			.map(mapParticipant)
			.sort(compareRecordsById),
		shearingHeader: mapShearingHeader(data.shearingHeader),
		shearingRecords: data.shearingRecords
			.map(mapShearingRecord)
			.sort(compareRecordsById),
		cleaningHeader: mapCleaningHeader(data.cleaningHeader),
		cleaningCommonRecords: data.cleaningCommonRecords
			.map(mapCleaningCommonRecord)
			.sort(compareRecordsById),
		groomingDetails: data.groomingDetails
			.map(mapGroomingDetail)
			.sort(compareRecordsById),
		dehearingDetails: data.dehearingDetails
			.map(mapDehearingDetail)
			.sort(compareRecordsById),
	}
}

function mapParticipant(participant: ParticipantData): ParticipantData {
	return {
		id: participant.id,
		permitId: participant.permitId,
		name: participant.name,
		lastNames: participant.lastNames,
		gender: participant.gender,
		identityNumber: participant.identityNumber,
		signature: participant.signature,
		notes: participant.notes,
	}
}

function mapShearingHeader(header: ShearingHeaderData): ShearingHeaderData {
	return {
		id: header.id,
		permitId: header.permitId,
		site: header.site,
		latitude: header.latitude,
		longitude: header.longitude,
		roundupCount: header.roundupCount,
		eventDate: header.eventDate,
		startTime: header.startTime,
		endTime: header.endTime,
		isCompleted: header.isCompleted,
	}
}

function mapShearingRecord(record: ShearingRecordData): ShearingRecordData {
	return {
		id: record.id,
		permitId: record.permitId,
		tagNumber: record.tagNumber,
		sex: record.sex,
		ageCategory: record.ageCategory,
		liveWeight: record.liveWeight,
		fiberLength: record.fiberLength,
		bodyCondition: record.bodyCondition,
		gestationStatus: record.gestationStatus,
		externalParasites: [...record.externalParasites].sort(compareText),
		mangeSeverity: record.mangeSeverity,
		hasDandruff: record.hasDandruff,
		isSheared: record.isSheared,
		isDead: record.isDead,
		observations: record.observations,
	}
}

function mapCleaningHeader(header: CleaningHeaderData): CleaningHeaderData {
	return {
		id: header.id,
		permitId: header.permitId,
		startDate: header.startDate,
		endDate: header.endDate,
		site: header.site,
		supervisors: header.supervisors,
		isCompleted: header.isCompleted,
	}
}

function mapCleaningCommonRecord(
	record: CleaningCommonData,
): CleaningCommonData {
	return {
		id: record.id,
		permitId: record.permitId,
		fleeceNumber: record.fleeceNumber,
		grossWeight: record.grossWeight,
	}
}

function mapGroomingDetail(detail: GroomingData): GroomingData {
	return {
		id: detail.id,
		cleaningCommonId: detail.cleaningCommonId,
		cleanWeight: detail.cleanWeight,
		dirtyWeight: detail.dirtyWeight,
		totalWeight: detail.totalWeight,
		isCompleted: detail.isCompleted,
	}
}

function mapDehearingDetail(detail: DehearingData): DehearingData {
	return {
		id: detail.id,
		cleaningCommonId: detail.cleaningCommonId,
		dehairedWeight: detail.dehairedWeight,
		bristleWeight: detail.bristleWeight,
		hasDandruff: detail.hasDandruff,
		dehairerName: detail.dehairerName,
		signature: detail.signature,
		isCompleted: detail.isCompleted,
	}
}

function compareRecordsById(
	left: { id: string },
	right: { id: string },
): number {
	return compareText(left.id, right.id)
}

function compareText(left: string, right: string): number {
	if (left < right) return -1
	if (left > right) return 1
	return 0
}
