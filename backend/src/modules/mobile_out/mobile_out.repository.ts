import { db } from "@db"
import type { PermitData } from "@shared"
import { and, asc, eq, inArray } from "drizzle-orm"
import { assignments, permits } from "../../db/schema"
import {
	getPermitDataHash,
	PERMIT_DATA_HASH_VERSION,
} from "../permit-sync/permit-data-hash"
import { getPermitFieldData } from "../permit-sync/permit-field-data"
import { getUserFullName } from "../users/user-name"
import type { MobilePermitData } from "./mobile_out.types"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function listMobilePermitsByUserId(
	userId: string,
): Promise<MobilePermitData[]> {
	return db.transaction(async (tx) => {
		const initialAssignments = await tx
			.select({ permitId: assignments.permitId })
			.from(assignments)
			.where(eq(assignments.userId, userId))
			.orderBy(asc(assignments.permitId))

		if (initialAssignments.length === 0) return []

		const initialPermitIds = initialAssignments.map(
			(assignment) => assignment.permitId,
		)

		await lockPermits(tx, initialPermitIds)

		const currentAssignments = await tx
			.select({ permitId: assignments.permitId })
			.from(assignments)
			.where(
				and(
					eq(assignments.userId, userId),
					inArray(assignments.permitId, initialPermitIds),
				),
			)

		const currentPermitIds = currentAssignments.map(
			(assignment) => assignment.permitId,
		)

		if (currentPermitIds.length === 0) return []

		await markAssignedPermitsInProgress(tx, currentPermitIds)

		const rows = await getAssignmentsWithData(tx, userId, currentPermitIds)
		return rows.map(mapMobilePermit)
	})
}

export async function getMobilePermitByUserId(
	userId: string,
	permitId: string,
): Promise<MobilePermitData | null> {
	return db.transaction(async (tx) => {
		await lockPermits(tx, [permitId])

		const assignment = await tx.query.assignments.findFirst({
			where: and(
				eq(assignments.userId, userId),
				eq(assignments.permitId, permitId),
			),
			columns: { permitId: true },
		})

		if (!assignment) return null

		await markAssignedPermitsInProgress(tx, [permitId])

		const rows = await getAssignmentsWithData(tx, userId, [permitId])
		const row = rows[0]
		return row ? mapMobilePermit(row) : null
	})
}

async function lockPermits(tx: DbTransaction, permitIds: string[]) {
	await tx
		.select({ id: permits.id })
		.from(permits)
		.where(inArray(permits.id, permitIds))
		.orderBy(asc(permits.id))
		.for("update")
}

async function markAssignedPermitsInProgress(
	tx: DbTransaction,
	permitIds: string[],
) {
	await tx
		.update(permits)
		.set({ syncStatus: "in_progress", updatedAt: new Date() })
		.where(
			and(
				eq(permits.syncStatus, "assigned"),
				inArray(permits.id, permitIds),
			),
		)
}

function getAssignmentsWithData(
	tx: DbTransaction,
	userId: string,
	permitIds: string[],
) {
	return tx.query.assignments.findMany({
		where: and(
			eq(assignments.userId, userId),
			inArray(assignments.permitId, permitIds),
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
				},
			},
		},
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.assignedAt),
			sortAsc(table.id),
		],
	})
}

type AssignmentWithData = Awaited<
	ReturnType<typeof getAssignmentsWithData>
>[number]

function mapMobilePermit(assignment: AssignmentWithData): MobilePermitData {
	const { permit } = assignment
	const fieldData = getPermitFieldData(permit)
	const permitData: PermitData = {
		id: permit.id,
		permitNumber: permit.permitNumber,
		seasonId: permit.seasonId,
		seasonName: permit.season.name,
		communityId: permit.communityId,
		regionalId: permit.community.regionalId,
		departmentId: permit.community.regional.departmentId,
		userId: assignment.userId,
		userFullName: getUserFullName(assignment.user),
		syncStatus: permit.syncStatus,
		syncedAt: permit.syncedAt?.toISOString() ?? null,
	}

	return {
		permit: permitData,
		serverHash: getPermitDataHash(fieldData),
		hashVersion: PERMIT_DATA_HASH_VERSION,
		fieldData,
	}
}
