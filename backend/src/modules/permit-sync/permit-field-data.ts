import type { PermitFieldData } from "@shared"

type StoredPermitData = {
	participants: PermitFieldData["participants"]
	shearingHeader: PermitFieldData["shearingHeader"] | null
	shearingRecords: PermitFieldData["shearingRecords"]
	cleaningHeader: PermitFieldData["cleaningHeader"] | null
	cleaningCommonRecords: Array<
		PermitFieldData["cleaningCommonRecords"][number] & {
			grooming: PermitFieldData["groomingDetails"][number] | null
			dehearing: PermitFieldData["dehearingDetails"][number] | null
		}
	>
}

export function getPermitFieldData(
	permit: StoredPermitData,
): PermitFieldData | null {
	const hasCollectedData =
		permit.participants.length > 0 ||
		permit.shearingHeader !== null ||
		permit.shearingRecords.length > 0 ||
		permit.cleaningHeader !== null ||
		permit.cleaningCommonRecords.length > 0

	if (!hasCollectedData) return null

	if (!permit.shearingHeader || !permit.cleaningHeader) {
		throw new Error("Los datos sincronizados del permiso están incompletos")
	}

	return {
		participants: permit.participants,
		shearingHeader: permit.shearingHeader,
		shearingRecords: permit.shearingRecords,
		cleaningHeader: permit.cleaningHeader,
		cleaningCommonRecords: permit.cleaningCommonRecords.map(
			({ grooming: _grooming, dehearing: _dehearing, ...record }) =>
				record,
		),
		groomingDetails: permit.cleaningCommonRecords.flatMap((record) =>
			record.grooming ? [record.grooming] : [],
		),
		dehearingDetails: permit.cleaningCommonRecords.flatMap((record) =>
			record.dehearing ? [record.dehearing] : [],
		),
	}
}
