import { db } from "@db"
import { and, desc, eq } from "drizzle-orm"
import {
	assignments,
	cleaningCommonRecords,
	cleaningHeaders,
	dehearingDetails,
	groomingDetails,
	participants,
	permitSyncVersions,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../../db/schema"
import {
	PermitNotFoundError,
	PermitSyncConflictError,
	PermitSyncForbiddenError,
} from "./mobile_in.errors"

import type { PermitSyncResult, SyncFieldData } from "./mobile_in.types"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function saveSyncFieldData(
	data: SyncFieldData,
	userId: string,
): Promise<PermitSyncResult> {
	const syncedAt = new Date()
	let syncVersion = 0

	await db.transaction(async (tx) => {
		const [existingPermit] = await tx
			.select()
			.from(permits)
			.where(eq(permits.id, data.permit.id))
			.for("update")

		if (!existingPermit) {
			throw new PermitNotFoundError("El permiso no existe")
		}

		const activeAssignment = await tx.query.assignments.findFirst({
			where: and(
				eq(assignments.permitId, data.permit.id),
				eq(assignments.userId, userId),
				eq(assignments.active, true),
			),
		})

		if (!activeAssignment) {
			throw new PermitSyncForbiddenError(
				"No tienes autorización para enviar este permiso",
			)
		}

		if (
			existingPermit.syncStatus !== "in_progress" &&
			existingPermit.syncStatus !== "reopened"
		) {
			throw new PermitSyncConflictError(
				"El permiso no está disponible para sincronizar",
			)
		}

		const latestVersion = await tx.query.permitSyncVersions.findFirst({
			where: eq(permitSyncVersions.permitId, data.permit.id),
			orderBy: [desc(permitSyncVersions.version)],
		})
		const currentVersion = latestVersion?.version ?? null

		if (data.expectedSyncVersion !== currentVersion) {
			throw new PermitSyncConflictError(
				"El permiso cambió en el servidor. Vuelve a descargarlo antes de enviarlo",
			)
		}

		syncVersion = (currentVersion ?? 0) + 1

		await deletePermitChildData(data, tx)
		await insertPermitChildData(data, tx)
		await tx.insert(permitSyncVersions).values({
			id: crypto.randomUUID(),
			permitId: data.permit.id,
			version: syncVersion,
			submittedByUserId: userId,
			submittedAt: syncedAt,
		})
		await tx
			.update(permits)
			.set({
				syncStatus: "synced",
				syncedAt,
				updatedAt: new Date(),
			})
			.where(eq(permits.id, data.permit.id))
	})

	return {
		permitId: data.permit.id,
		syncStatus: "synced",
		syncVersion,
		syncedAt: syncedAt.toISOString(),
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
