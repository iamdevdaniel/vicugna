import { pool } from "@config"
import { db } from "@db"
import { and, asc, eq, inArray } from "drizzle-orm"
import { assignments, communities, permits, seasons, users } from "../schema"

const SEEDED_PERMITS = [
	{
		id: "permit-seed-asg-01",
		permitNumber: "ASG-001",
	},
	{
		id: "permit-seed-asg-02",
		permitNumber: "ASG-002",
	},
	{
		id: "permit-seed-asg-03",
		permitNumber: "ASG-003",
	},
] as const

async function seedAssignments() {
	const community = await db.query.communities.findFirst({
		orderBy: [asc(communities.name), asc(communities.id)],
	})

	if (!community) {
		throw new Error("No community found")
	}

	const activeSeason = await db.query.seasons.findFirst({
		where: eq(seasons.isActive, true),
	})

	if (!activeSeason) {
		throw new Error("No active season found")
	}

	const availableUsers = await db.query.users.findMany({
		where: and(eq(users.role, "user"), eq(users.isActive, true)),
		orderBy: [asc(users.fullName)],
	})

	if (availableUsers.length < 4) {
		throw new Error(
			"Need at least 4 active non-admin users to seed assignments",
		)
	}

	const sharedUser = availableUsers[0]
	const secondaryUsers = availableUsers.slice(1, 4)
	const permitIds = SEEDED_PERMITS.map((permit) => permit.id)

	await db.transaction(async (tx) => {
		for (const permit of SEEDED_PERMITS) {
			await tx
				.insert(permits)
				.values({
					id: permit.id,
					seasonId: activeSeason.id,
					communityId: community.id,
					permitNumber: permit.permitNumber,
				})
				.onConflictDoUpdate({
					target: permits.id,
					set: {
						seasonId: activeSeason.id,
						communityId: community.id,
						permitNumber: permit.permitNumber,
						updatedAt: new Date(),
					},
				})
		}

		await tx
			.delete(assignments)
			.where(inArray(assignments.permitId, permitIds))

		for (const [index, permit] of SEEDED_PERMITS.entries()) {
			const secondaryUser = secondaryUsers[index]

			await tx.insert(assignments).values([
				{
					id: `assignment-seed-asg-${index + 1}-01`,
					seasonId: activeSeason.id,
					communityId: community.id,
					userId: sharedUser.id,
					permitId: permit.id,
					position: 0,
					active: true,
				},
				{
					id: `assignment-seed-asg-${index + 1}-02`,
					seasonId: activeSeason.id,
					communityId: community.id,
					userId: secondaryUser.id,
					permitId: permit.id,
					position: 1,
					active: false,
				},
			])
		}
	})
}

seedAssignments()
	.then(async () => {
		await pool.end()
		console.log("🌱 Assignments seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
