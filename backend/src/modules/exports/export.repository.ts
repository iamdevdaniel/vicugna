import { db, permits } from "@db"
import { eq } from "drizzle-orm"

export async function findSyncedPermitForParticipantExport(permitId: string) {
	return db.query.permits.findFirst({
		where: eq(permits.id, permitId),
		with: {
			community: {
				with: {
					regional: true,
				},
			},
			participants: true,
			shearingHeader: true,
		},
	})
}
