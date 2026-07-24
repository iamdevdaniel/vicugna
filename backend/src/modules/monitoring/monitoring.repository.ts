import { assignments, db } from "@db"
import { eq } from "drizzle-orm"

export async function listMonitoringAssignments(seasonId: string) {
	return db.query.assignments.findMany({
		where: eq(assignments.seasonId, seasonId),
		with: {
			community: true,
			permit: true,
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
