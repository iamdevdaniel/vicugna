import { db } from "@db"
import type { PermitFieldData } from "@shared"
import { and, eq } from "drizzle-orm"
import {
	assignments,
	cleaningCommonRecords,
	cleaningHeaders,
	dehearingDetails,
	groomingDetails,
	participants,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../../db/schema"
import {
	getPermitDataHash,
	PERMIT_DATA_HASH_VERSION,
} from "../permit-sync/permit-data-hash"
import { getPermitFieldData } from "../permit-sync/permit-field-data"
import { PermitSyncError, permitSyncErrors } from "./mobile_in.errors"
import type { PermitSyncResult, SyncFieldData } from "./mobile_in.types"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function saveSyncFieldData(
	data: SyncFieldData,
	userId: string,
): Promise<PermitSyncResult> {
	return db.transaction(async (tx) => {
		const [existingPermit] = await tx
			.select()
			.from(permits)
			.where(eq(permits.id, data.permitId))
			.for("update")

		if (!existingPermit) {
			throw new PermitSyncError(permitSyncErrors.notFound)
		}

		const assignment = await tx.query.assignments.findFirst({
			where: and(
				eq(assignments.permitId, data.permitId),
				eq(assignments.userId, userId),
			),
		})

		if (!assignment) {
			throw new PermitSyncError(permitSyncErrors.forbidden)
		}

		const storedPermit = await tx.query.permits.findFirst({
			where: eq(permits.id, data.permitId),
			with: {
				participants: true,
				shearingHeader: true,
				shearingRecords: true,
				cleaningHeader: true,
				cleaningCommonRecords: {
					with: { grooming: true, dehearing: true },
				},
			},
		})

		if (!storedPermit) {
			throw new PermitSyncError(permitSyncErrors.notFound)
		}

		const serverData = getPermitFieldData(storedPermit)
		const deviceData = mapUploadToPermitFieldData(data)
		const serverHash = getPermitDataHash(serverData)
		const deviceHash = getPermitDataHash(deviceData)

		if (deviceHash === serverHash) {
			return getSyncResult(existingPermit, serverHash)
		}

		if (data.baseHash !== serverHash) {
			throw new PermitSyncError(permitSyncErrors.dataConflict)
		}

		if (
			existingPermit.syncStatus !== "in_progress" &&
			existingPermit.syncStatus !== "reopened"
		) {
			throw new PermitSyncError(permitSyncErrors.unavailable)
		}

		const syncedAt = new Date()
		await deletePermitChildData(data.permitId, tx)
		await insertPermitChildData(deviceData, tx)
		await tx
			.update(permits)
			.set({
				syncStatus: "synced",
				syncedAt,
				updatedAt: syncedAt,
			})
			.where(eq(permits.id, data.permitId))

		return {
			permitId: data.permitId,
			syncStatus: "synced",
			serverHash: deviceHash,
			hashVersion: PERMIT_DATA_HASH_VERSION,
			syncedAt: syncedAt.toISOString(),
		}
	})
}

function mapUploadToPermitFieldData(data: SyncFieldData): PermitFieldData {
	return {
		participants: data.participants,
		shearingHeader: data.shearingHeader,
		shearingRecords: data.shearingRecords,
		cleaningHeader: data.cleaningHeader,
		cleaningCommonRecords: data.cleaningCommonRecords,
		groomingDetails: data.groomingDetails,
		dehearingDetails: data.dehearingDetails,
	}
}

function getSyncResult(
	permit: typeof permits.$inferSelect,
	serverHash: string,
): PermitSyncResult {
	return {
		permitId: permit.id,
		syncStatus: permit.syncStatus,
		serverHash,
		hashVersion: PERMIT_DATA_HASH_VERSION,
		syncedAt: permit.syncedAt?.toISOString() ?? null,
	}
}

async function deletePermitChildData(permitId: string, tx: DbTransaction) {
	await tx.delete(participants).where(eq(participants.permitId, permitId))
	await tx
		.delete(shearingHeaders)
		.where(eq(shearingHeaders.permitId, permitId))
	await tx
		.delete(shearingRecords)
		.where(eq(shearingRecords.permitId, permitId))
	await tx
		.delete(cleaningHeaders)
		.where(eq(cleaningHeaders.permitId, permitId))
	await tx
		.delete(cleaningCommonRecords)
		.where(eq(cleaningCommonRecords.permitId, permitId))
}

async function insertPermitChildData(data: PermitFieldData, tx: DbTransaction) {
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
