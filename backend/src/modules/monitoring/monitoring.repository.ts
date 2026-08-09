import { assignments, db, permits } from "@db"
import { and, eq } from "drizzle-orm"

export async function listMonitoringAssignments(seasonId: string) {
	return db.query.assignments.findMany({
		where: eq(assignments.seasonId, seasonId),
		with: {
			community: true,
			permit: {
				with: {
					participants: true,
					shearingRecords: true,
					cleaningCommonRecords: true,
				},
			},
			user: true,
		},
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.communityId),
			sortAsc(table.permitId),
			sortAsc(table.position),
			sortAsc(table.id),
		],
	})
}

export async function reopenSyncedPermit(permitId: string): Promise<boolean> {
	const reopenedPermits = await db
		.update(permits)
		.set({
			syncStatus: "reopened",
			updatedAt: new Date(),
		})
		.where(and(eq(permits.id, permitId), eq(permits.syncStatus, "synced")))
		.returning({ id: permits.id })

	return reopenedPermits.length === 1
}
