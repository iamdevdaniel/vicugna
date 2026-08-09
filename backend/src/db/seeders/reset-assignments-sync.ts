import { pool } from "@config"
import { db } from "@db"
import { eq, inArray } from "drizzle-orm"
import {
	cleaningCommonRecords,
	cleaningHeaders,
	dehearingDetails,
	groomingDetails,
	participants,
	permitSyncVersions,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../schema"

const SEEDED_PERMIT_IDS = [
	"permit-seed-asg-01",
	"permit-seed-asg-02",
	"permit-seed-asg-03",
] as const

async function resetAssignmentsSync() {
	const cleaningRecords = await db.query.cleaningCommonRecords.findMany({
		where: inArray(cleaningCommonRecords.permitId, SEEDED_PERMIT_IDS),
		columns: { id: true },
	})

	const cleaningRecordIds = cleaningRecords.map((record) => record.id)

	await db.transaction(async (tx) => {
		if (cleaningRecordIds.length > 0) {
			await tx
				.delete(groomingDetails)
				.where(
					inArray(
						groomingDetails.cleaningCommonId,
						cleaningRecordIds,
					),
				)
			await tx
				.delete(dehearingDetails)
				.where(
					inArray(
						dehearingDetails.cleaningCommonId,
						cleaningRecordIds,
					),
				)
		}

		await tx
			.delete(participants)
			.where(inArray(participants.permitId, SEEDED_PERMIT_IDS))
		await tx
			.delete(shearingHeaders)
			.where(inArray(shearingHeaders.permitId, SEEDED_PERMIT_IDS))
		await tx
			.delete(shearingRecords)
			.where(inArray(shearingRecords.permitId, SEEDED_PERMIT_IDS))
		await tx
			.delete(cleaningHeaders)
			.where(inArray(cleaningHeaders.permitId, SEEDED_PERMIT_IDS))
		await tx
			.delete(cleaningCommonRecords)
			.where(inArray(cleaningCommonRecords.permitId, SEEDED_PERMIT_IDS))
		await tx
			.delete(permitSyncVersions)
			.where(inArray(permitSyncVersions.permitId, SEEDED_PERMIT_IDS))

		for (const permitId of SEEDED_PERMIT_IDS) {
			await tx
				.update(permits)
				.set({
					syncStatus: "assigned",
					syncedAt: null,
					updatedAt: new Date(),
				})
				.where(eq(permits.id, permitId))
		}
	})
}

resetAssignmentsSync()
	.then(async () => {
		await pool.end()
		console.log("🪏 Assignment sync reset")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
