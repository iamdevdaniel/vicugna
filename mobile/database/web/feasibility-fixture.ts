import type { PermitData } from "@definitions/types"
import { getWebFieldDatabase } from "./setup"

export const FEASIBILITY_ACCOUNT_ID = "pwa-feasibility-user"
export const FEASIBILITY_PERMIT_ID = "pwa-feasibility-permit"

const feasibilityPermit: PermitData = {
	id: FEASIBILITY_PERMIT_ID,
	permitNumber: "PWA-TEST-01",
	seasonId: "pwa-season",
	seasonName: "Temporada de prueba",
	communityId: "agua-rica",
	regionalId: "calacoto",
	departmentId: "la-paz",
	userId: FEASIBILITY_ACCOUNT_ID,
	userFullName: "Usuario de prueba PWA",
	isActiveAssignmentUser: true,
	syncStatus: "in_progress",
	syncedAt: null,
	participantsStatus: "ready",
	shearingStatus: "disabled",
	cleaningStatus: "disabled",
}

export async function ensureFeasibilityPermit(): Promise<void> {
	const database = getWebFieldDatabase(FEASIBILITY_ACCOUNT_ID)

	await database.transaction("rw", database.permits, async () => {
		const existing = await database.permits.get(FEASIBILITY_PERMIT_ID)
		if (!existing) await database.permits.add(feasibilityPermit)
	})
}
