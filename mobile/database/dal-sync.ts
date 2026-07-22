import type { SyncFieldData } from "@definitions/types"
import { Q } from "@nozbe/watermelondb"
import {
	mapToCleaningCommon,
	mapToCleaningHeader,
	mapToDehearing,
	mapToGrooming,
	mapToParticipant,
	mapToPermit,
	mapToShearingHeader,
	mapToShearingRecord,
} from "./mappers"
import type {
	CleaningCommonModel,
	CleaningHeaderModel,
	DehearingModel,
	GroomingModel,
	ParticipantModel,
	PermitModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"
import { database } from "./setup"

export async function getFieldSyncData(
	permitId: string,
): Promise<SyncFieldData> {
	const permitRecord = await database
		.get<PermitModel>("permits")
		.find(permitId)
	const participants = await database
		.get<ParticipantModel>("participants")
		.query(Q.where("permitId", permitId))
		.fetch()
	const shearingHeaders = await database
		.get<ShearingHeaderModel>("shearingHeader")
		.query(Q.where("permitId", permitId))
		.fetch()
	const shearingRecords = await database
		.get<ShearingRecordModel>("shearingRecord")
		.query(Q.where("permitId", permitId))
		.fetch()
	const cleaningHeaders = await database
		.get<CleaningHeaderModel>("cleaningHeader")
		.query(Q.where("permitId", permitId))
		.fetch()
	const cleaningCommonRecords = await database
		.get<CleaningCommonModel>("cleaningCommon")
		.query(Q.where("permitId", permitId))
		.fetch()

	const cleaningCommonIds = cleaningCommonRecords.map((record) => record.id)
	const groomingDetails =
		cleaningCommonIds.length > 0
			? await database
					.get<GroomingModel>("grooming")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch()
			: []
	const dehearingDetails =
		cleaningCommonIds.length > 0
			? await database
					.get<DehearingModel>("dehearing")
					.query(
						Q.where("cleaningCommonId", Q.oneOf(cleaningCommonIds)),
					)
					.fetch()
			: []

	const shearingHeader = shearingHeaders[0]
	const cleaningHeader = cleaningHeaders[0]

	if (!shearingHeader) {
		throw new Error("Falta la cabecera de esquila")
	}

	if (!cleaningHeader) {
		throw new Error("Falta la cabecera de limpieza")
	}

	return {
		permit: mapToPermit(permitRecord),
		participants: participants.map(mapToParticipant),
		shearingHeader: mapToShearingHeader(shearingHeader),
		shearingRecords: shearingRecords.map(mapToShearingRecord),
		cleaningHeader: mapToCleaningHeader(cleaningHeader),
		cleaningCommonRecords: cleaningCommonRecords.map(mapToCleaningCommon),
		groomingDetails: groomingDetails.map(mapToGrooming),
		dehearingDetails: dehearingDetails.map(mapToDehearing),
	}
}
