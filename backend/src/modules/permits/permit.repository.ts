import { db } from "@db"
import { eq } from "drizzle-orm"
import {
	cleaningCommonRecords,
	cleaningHeaders,
	dehearingDetails,
	groomingDetails,
	participants,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../../db/schema"
import { PermitNotFoundError } from "./permit.errors"

import type { SyncFieldData } from "./permit.types"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function saveSyncFieldData(data: SyncFieldData) {
	await db.transaction(async (tx) => {
		const existingPermit = await tx.query.permits.findFirst({
			where: eq(permits.id, data.permit.id),
		})

		if (!existingPermit) {
			throw new PermitNotFoundError("Permit does not exist")
		}

		await deletePermitChildData(data, tx)
		await insertPermitChildData(data, tx)
		await tx
			.update(permits)
			.set({
				isSynced: true,
				syncedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(permits.id, data.permit.id))
	})

	return {
		permitId: data.permit.id,
		synced: true,
	}
}

async function deletePermitChildData(data: SyncFieldData, tx: DbTransaction) {
	await tx
		.delete(participants)
		.where(eq(participants.permitId, data.permit.id))
	await tx
		.delete(shearingHeaders)
		.where(eq(shearingHeaders.permitId, data.permit.id))
	await tx
		.delete(shearingRecords)
		.where(eq(shearingRecords.permitId, data.permit.id))
	await tx
		.delete(cleaningHeaders)
		.where(eq(cleaningHeaders.permitId, data.permit.id))
	await tx
		.delete(cleaningCommonRecords)
		.where(eq(cleaningCommonRecords.permitId, data.permit.id))
}

async function insertPermitChildData(data: SyncFieldData, tx: DbTransaction) {
	await tx.insert(shearingHeaders).values(data.shearingHeader)
	await tx.insert(cleaningHeaders).values(data.cleaningHeader)
	await tx.insert(participants).values(data.participants)
	await tx.insert(shearingRecords).values(data.shearingRecords)
	await tx.insert(cleaningCommonRecords).values(data.cleaningCommonRecords)

	if (data.groomingDetails.length > 0) {
		await tx.insert(groomingDetails).values(data.groomingDetails)
	}

	if (data.dehearingDetails.length > 0) {
		await tx.insert(dehearingDetails).values(data.dehearingDetails)
	}
}
