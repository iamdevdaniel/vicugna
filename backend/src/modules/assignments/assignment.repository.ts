import { db } from "@db"
import { and, eq, notExists } from "drizzle-orm"

import { assignments, permits, users } from "../../db/schema"
import type {
	AssignmentListItem,
	CreateAssignmentFormData,
	ManagedUserOption,
	SelectOption,
} from "./assignment.types"

export async function listAssignmentSeasons(): Promise<SelectOption[]> {
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

export async function listAssignmentCommunities(): Promise<SelectOption[]> {
	const rows = await db.query.communities.findMany({
		orderBy: (table, { asc: sortAsc }) => [sortAsc(table.name)],
	})

	return rows.map((community) => ({
		id: community.id,
		name: community.name,
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

export async function listAvailableAssignmentUsers(
	seasonId: string,
): Promise<ManagedUserOption[]> {
	const rows = await db.query.users.findMany({
		where: and(
			eq(users.role, "user"),
			eq(users.isActive, true),
			notExists(
				db
					.select({ id: assignments.id })
					.from(assignments)
					.where(
						and(
							eq(assignments.seasonId, seasonId),
							eq(assignments.userId, users.id),
						),
					),
			),
		),
		orderBy: (table, { asc: sortAsc }) => [sortAsc(table.fullName)],
	})

	return rows.map((user) => ({
		id: user.id,
		name: user.fullName,
		isActive: user.isActive,
	}))
}

export async function listAssignments(): Promise<AssignmentListItem[]> {
	const rows = await db.query.assignments.findMany({
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

export async function findAssignmentBySeasonAndUser(
	seasonId: string,
	userId: string,
) {
	return db.query.assignments.findFirst({
		where: and(
			eq(assignments.seasonId, seasonId),
			eq(assignments.userId, userId),
		),
	})
}

export async function saveAssignment(data: CreateAssignmentFormData) {
	await db.transaction(async (tx) => {
		const permitId = crypto.randomUUID()

		await tx.insert(permits).values({
			id: permitId,
			permitNumber: data.permitNumber,
		})

		await tx.insert(assignments).values({
			id: crypto.randomUUID(),
			seasonId: data.seasonId,
			communityId: data.communityId,
			userId: data.userId,
			permitId,
		})
	})
}
