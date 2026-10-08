import { db } from "@db"
import { and, eq } from "drizzle-orm"

import { assignments, permits, users } from "../../db/schema"
import { getUserFullName } from "../users/user-name"
import type {
	AssignmentListItem,
	ManagedUserOption,
	PermitListItem,
	SelectOption,
} from "./assignment.types"

export async function listCommunities(): Promise<SelectOption[]> {
	const rows = await db.query.communities.findMany({
		orderBy: (table, { asc: sortAsc }) => [sortAsc(table.name)],
	})

	return rows.map((community) => ({
		id: community.id,
		name: community.name,
	}))
}

export async function listPermits(): Promise<PermitListItem[]> {
	const rows = await db.query.permits.findMany({
		with: {
			community: true,
		},
		orderBy: (table, { desc }) => [desc(table.createdAt), desc(table.id)],
	})

	return rows.map((permit) => ({
		id: permit.id,
		communityId: permit.communityId,
		communityName: permit.community.name,
		permitNumber: permit.permitNumber,
		syncStatus: permit.syncStatus,
	}))
}

export async function listAssignmentUsers(): Promise<ManagedUserOption[]> {
	const rows = await db.query.users.findMany({
		where: and(eq(users.role, "user"), eq(users.isActive, true)),
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.paternalLastName),
			sortAsc(table.maternalLastName),
			sortAsc(table.firstName),
		],
	})

	return rows.map((user) => ({
		id: user.id,
		name: getUserFullName(user),
		isActive: user.isActive,
	}))
}

export async function listAssignments(
	seasonId?: string,
): Promise<AssignmentListItem[]> {
	const rows = await db.query.assignments.findMany({
		where: seasonId ? eq(assignments.seasonId, seasonId) : undefined,
		with: {
			season: true,
			community: true,
			user: true,
			permit: true,
		},
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.assignedAt),
			sortAsc(table.id),
		],
	})

	return rows.map((assignment) => ({
		id: assignment.id,
		permitId: assignment.permitId,
		communityId: assignment.communityId,
		userId: assignment.userId,
		seasonName: assignment.season.name,
		communityName: assignment.community.name,
		userFullName: getUserFullName(assignment.user),
		permitNumber: assignment.permit.permitNumber,
	}))
}

export async function listPermitsBySeason(
	seasonId: string,
): Promise<PermitListItem[]> {
	const rows = await db.query.permits.findMany({
		where: eq(permits.seasonId, seasonId),
		with: {
			community: true,
		},
		orderBy: (table, { desc }) => [desc(table.createdAt), desc(table.id)],
	})

	return rows.map((permit) => ({
		id: permit.id,
		communityId: permit.communityId,
		communityName: permit.community.name,
		permitNumber: permit.permitNumber,
		syncStatus: permit.syncStatus,
	}))
}

export async function findPermitBySeasonAndNumber(
	seasonId: string,
	permitNumber: string,
) {
	return db.query.permits.findFirst({
		where: and(
			eq(permits.seasonId, seasonId),
			eq(permits.permitNumber, permitNumber),
		),
	})
}

export async function findPermitById(permitId: string) {
	return db.query.permits.findFirst({
		where: eq(permits.id, permitId),
	})
}

export async function createPermit(
	seasonId: string,
	communityId: string,
	permitNumber: string,
) {
	const permitId = crypto.randomUUID()

	await db.insert(permits).values({
		id: permitId,
		seasonId,
		communityId,
		permitNumber,
	})

	return permitId
}

export async function updatePermitNumber(
	permitId: string,
	permitNumber: string,
) {
	await db
		.update(permits)
		.set({
			permitNumber,
			updatedAt: new Date(),
		})
		.where(eq(permits.id, permitId))
}

export type SavePermitAssignmentResult =
	| "saved"
	| "permit_missing"
	| "permit_locked"
	| "user_unavailable"

export async function saveAssignmentForPermit(
	permitId: string,
	userId: string | null,
): Promise<SavePermitAssignmentResult> {
	return db.transaction(async (tx) => {
		const [permit] = await tx
			.select({
				id: permits.id,
				seasonId: permits.seasonId,
				communityId: permits.communityId,
				syncStatus: permits.syncStatus,
			})
			.from(permits)
			.where(eq(permits.id, permitId))
			.for("update")

		if (!permit) return "permit_missing"
		if (
			permit.syncStatus !== "created" &&
			permit.syncStatus !== "assigned"
		) {
			return "permit_locked"
		}

		if (userId) {
			const [eligibleUser] = await tx
				.select({ id: users.id })
				.from(users)
				.where(
					and(
						eq(users.id, userId),
						eq(users.role, "user"),
						eq(users.isActive, true),
					),
				)
				.for("update")

			if (!eligibleUser) return "user_unavailable"
		}

		await tx.delete(assignments).where(eq(assignments.permitId, permitId))

		if (userId) {
			await tx.insert(assignments).values({
				id: crypto.randomUUID(),
				seasonId: permit.seasonId,
				communityId: permit.communityId,
				userId,
				permitId,
			})
		}

		await tx
			.update(permits)
			.set({
				syncStatus: userId ? "assigned" : "created",
				updatedAt: new Date(),
			})
			.where(eq(permits.id, permitId))

		return "saved"
	})
}
