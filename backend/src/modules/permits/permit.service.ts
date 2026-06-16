import type { PermitSyncData } from "./permit.types"

export async function syncPermitData(data: PermitSyncData) {
	if (!data.permit.id) {
		throw new Error("Permit id is required")
	}

	return {
		permitId: data.permit.id,
		synced: true,
	}
}
