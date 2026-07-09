import { db } from "@db"
import { and, eq, notInArray } from "drizzle-orm"

import { assignments, permits, users } from "../../db/schema"
import type {
	AssignmentListItem,
	CreateAssignmentData,
	ManagedUserOption,
	PermitListItem,
	SelectOption,
} from "./assignment.types"

export async function listSeasons(): Promise<SelectOption[]> {
	const rows = await db.query.seasons.findMany({
		orderBy: (table, { desc, asc: sortAsc }) => [
			desc(table.isActive),
			sortAsc(table.startDate),
			sortAsc(table.name),
		],
	})

	return rows.map((season) => ({
		id: season.id,
		name: season.name,
	}))
}

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
		orderBy: (table, { desc }) => [desc(table.createdAt), desc(table.id)],
	})

	return rows.map((permit) => ({
		id: permit.id,
		permitNumber: permit.permitNumber,
	}))
}

export async function listAssignmentUsers(): Promise<ManagedUserOption[]> {
	const rows = await db.query.users.findMany({
		where: and(eq(users.role, "user"), eq(users.isActive, true)),
		orderBy: (table, { asc: sortAsc }) => [sortAsc(table.fullName)],
	})

	return rows.map((user) => ({
		id: user.id,
		name: user.fullName,
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
		seasonName: assignment.season.name,
		communityName: assignment.community.name,
		userFullName: assignment.user.fullName,
		permitNumber: assignment.permit.permitNumber,
	}))
}

export async function findPermitByNumber(permitNumber: string) {
	return db.query.permits.findFirst({
		where: eq(permits.permitNumber, permitNumber),
	})
}

export async function listAssignedUserIdsByPermit(
	permitId: string,
): Promise<string[]> {
	const rows = await db.query.assignments.findMany({
		where: eq(assignments.permitId, permitId),
		columns: {
			userId: true,
		},
	})

	return rows.map((row) => row.userId)
}

export async function listEligibleAssignmentUsersByPermit(
	permitId: string,
): Promise<ManagedUserOption[]> {
	const assignedUserIds = await listAssignedUserIdsByPermit(permitId)

	const rows = await db.query.users.findMany({
		where: and(
			eq(users.role, "user"),
			eq(users.isActive, true),
			assignedUserIds.length > 0
				? notInArray(users.id, assignedUserIds)
				: undefined,
		),
		orderBy: (table, { asc: sortAsc }) => [sortAsc(table.fullName)],
	})

	return rows.map((user) => ({
		id: user.id,
		name: user.fullName,
		isActive: user.isActive,
	}))
}

export async function createPermit(permitNumber: string) {
	const permitId = crypto.randomUUID()

	await db.insert(permits).values({
		id: permitId,
		permitNumber,
	})

	return permitId
}

export async function createAssignment(data: CreateAssignmentData) {
	await db.transaction(async (tx) => {
		const existingAssignment = await tx.query.assignments.findFirst({
			where: eq(assignments.permitId, data.permitId),
		})

		await tx.insert(assignments).values({
			id: crypto.randomUUID(),
			seasonId: data.seasonId,
			communityId: data.communityId,
			userId: data.userId,
			permitId: data.permitId,
			active: existingAssignment ? false : true,
		})
	})
}
