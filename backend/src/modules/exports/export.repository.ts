import { db, permits } from "@db"
import { eq } from "drizzle-orm"

export async function findSyncedPermitForExport(permitId: string) {
	return db.query.permits.findFirst({
		where: eq(permits.id, permitId),
		with: {
			participants: true,
			shearingHeader: true,
			shearingRecords: true,
			cleaningHeader: true,
			cleaningCommonRecords: {
				with: {
					grooming: true,
					dehearing: true,
				},
			},
		},
	})
}
