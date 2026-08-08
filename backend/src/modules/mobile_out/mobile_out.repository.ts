import { db } from "@db"
import type { PermitData, PermitFieldData } from "@shared"
import { and, eq, inArray } from "drizzle-orm"

import { assignments, permits } from "../../db/schema"
import type { MobilePermitData } from "./mobile_out.types"

export async function listMobilePermitsByUserId(
	userId: string,
): Promise<MobilePermitData[]> {
	const rows = await db.transaction(async (tx) => {
		await tx
			.update(permits)
			.set({ syncStatus: "in_progress", updatedAt: new Date() })
			.where(
				and(
					eq(permits.syncStatus, "assigned"),
					inArray(
						permits.id,
						tx
							.select({ permitId: assignments.permitId })
							.from(assignments)
							.where(
								and(
									eq(assignments.userId, userId),
									eq(assignments.active, true),
								),
							),
					),
				),
			)

		return tx.query.assignments.findMany({
			where: and(
				eq(assignments.userId, userId),
				eq(assignments.active, true),
			),
			with: {
				user: true,
				permit: {
					with: {
						season: true,
						community: { with: { regional: true } },
						participants: true,
						shearingHeader: true,
						shearingRecords: true,
						cleaningHeader: true,
						cleaningCommonRecords: {
							with: { grooming: true, dehearing: true },
						},
						permitSyncVersions: {
							orderBy: (table, { desc }) => [desc(table.version)],
							limit: 1,
						},
					},
				},
			},
			orderBy: (table, { asc }) => [asc(table.position), asc(table.id)],
		})
	})
	const mapFieldData = (
		permit: (typeof rows)[number]["permit"],
	): PermitFieldData => {
		if (!permit.shearingHeader || !permit.cleaningHeader) {
			throw new Error(
				"Los datos sincronizados del permiso están incompletos",
			)
		}

		return {
			participants:
				permit.participants as PermitFieldData["participants"],
			shearingHeader: permit.shearingHeader,
			shearingRecords:
				permit.shearingRecords as PermitFieldData["shearingRecords"],
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

	return rows.map((assignment) => {
		const { permit } = assignment
		const latestVersion = permit.permitSyncVersions[0]
		const permitData: PermitData = {
			id: permit.id,
			permitNumber: permit.permitNumber,
			seasonId: permit.seasonId,
			seasonName: permit.season.name,
			communityId: permit.communityId,
			regionalId: permit.community.regionalId,
			departmentId: permit.community.regional.departmentId,
			userId: assignment.userId,
			userFullName: assignment.user.fullName,
			isActiveAssignmentUser: assignment.active,
			syncStatus: permit.syncStatus,
			syncedAt: permit.syncedAt?.toISOString() ?? null,
		}

		return {
			permit: permitData,
			syncVersion: latestVersion?.version ?? null,
			fieldData: latestVersion ? mapFieldData(permit) : null,
		}
	})
}
