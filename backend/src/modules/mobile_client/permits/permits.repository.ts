import { db } from "@db"
import { eq } from "drizzle-orm"

import { assignments } from "../../../db/schema"
import type { MobilePermitData } from "./permits.types"

export async function listMobilePermitsByUserId(
	userId: string,
): Promise<MobilePermitData[]> {
	const rows = await db.query.assignments.findMany({
		where: eq(assignments.userId, userId),
		with: {
			user: true,
			permit: {
				with: {
					season: true,
					community: {
						with: {
							regional: {
								with: {
									department: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.position),
			sortAsc(table.id),
		],
	})

	return rows.map((assignment) => ({
		id: assignment.permit.id,
		permitNumber: assignment.permit.permitNumber,
		seasonId: assignment.permit.seasonId,
		seasonName: assignment.permit.season.name,
		communityId: assignment.permit.communityId,
		regionalId: assignment.permit.community.regionalId,
		departmentId: assignment.permit.community.regional.departmentId,
		userId: assignment.userId,
		userFullName: assignment.user.fullName,
		isActiveAssignmentUser: assignment.active,
	}))
}
