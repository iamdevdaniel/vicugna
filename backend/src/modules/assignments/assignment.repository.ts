import { db } from "@db"
import { and, count, eq } from "drizzle-orm"

import { permits, users } from "../../db/schema"
import type {
	AssignmentListItem,
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

export async function listAssignments(): Promise<AssignmentListItem[]> {
	const rows = await db.query.communityAssignments.findMany({
		with: {
			season: true,
			community: true,
			user: true,
		},
		orderBy: (table, { asc: sortAsc }) => [
			sortAsc(table.assignedAt),
			sortAsc(table.id),
		],
	})

	const permitCounts = await db
		.select({
			seasonId: permits.seasonId,
			communityId: permits.communityId,
			permitCount: count(),
		})
		.from(permits)
		.groupBy(permits.seasonId, permits.communityId)

	const permitCountByAssignment = new Map(
		permitCounts.map((row) => [
			buildAssignmentKey(row.seasonId, row.communityId),
			Number(row.permitCount),
		]),
	)

	return rows.map((assignment) => ({
		id: assignment.id,
		seasonName: assignment.season.name,
		communityName: assignment.community.name,
		userFullName: assignment.user.fullName,
		permitCount:
			permitCountByAssignment.get(
				buildAssignmentKey(assignment.seasonId, assignment.communityId),
			) ?? 0,
	}))
}

function buildAssignmentKey(seasonId: string, communityId: string) {
	return `${seasonId}:${communityId}`
}
