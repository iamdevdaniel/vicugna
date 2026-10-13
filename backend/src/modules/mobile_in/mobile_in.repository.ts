import { db } from "@db"
import { and, desc, eq } from "drizzle-orm"
import {
	assignments,
	cleaningCommonRecords,
	cleaningHeaders,
	dehearingDetails,
	groomingDetails,
	participants,
	permitSyncAttempts,
	permits,
	shearingHeaders,
	shearingRecords,
} from "../../db/schema"
import { PermitSyncError, permitSyncErrors } from "./mobile_in.errors"

import type { PermitSyncResult, SyncFieldData } from "./mobile_in.types"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function getPreviousSyncResponse(
	data: SyncFieldData,
	userId: string,
	payloadHash: string,
): Promise<PermitSyncResult | null> {
	if (!data.syncAttemptId) return null

	const previousAttempt = await db.query.permitSyncAttempts.findFirst({
		where: eq(permitSyncAttempts.syncAttemptId, data.syncAttemptId),
	})

	return resolveRepeatedSyncResult(
		previousAttempt,
		data.permit.id,
		userId,
		payloadHash,
	)
}

export async function saveSyncFieldData(
	data: SyncFieldData,
	userId: string,
	payloadHash: string,
): Promise<PermitSyncResult> {
	const syncedAt = new Date()

	return db.transaction(async (tx) => {
		const [existingPermit] = await tx
			.select()
			.from(permits)
			.where(eq(permits.id, data.permit.id))
			.for("update")

		if (!existingPermit) {
			throw new PermitSyncError(permitSyncErrors.notFound)
		}

		if (data.syncAttemptId) {
			const previousAttempt = await tx.query.permitSyncAttempts.findFirst(
				{
					where: eq(
						permitSyncAttempts.syncAttemptId,
						data.syncAttemptId,
					),
				},
			)

			const repeatedResult = resolveRepeatedSyncResult(
				previousAttempt,
				data.permit.id,
				userId,
				payloadHash,
			)
			if (repeatedResult) return repeatedResult
		}

		const assignment = await tx.query.assignments.findFirst({
			where: and(
				eq(assignments.permitId, data.permit.id),
				eq(assignments.userId, userId),
			),
		})

		if (!assignment) {
			throw new PermitSyncError(permitSyncErrors.forbidden)
		}

		const latestVersion = await tx.query.permitSyncAttempts.findFirst({
			where: eq(permitSyncAttempts.permitId, data.permit.id),
			orderBy: [desc(permitSyncAttempts.version)],
		})
		const currentVersion = latestVersion?.version ?? null

		if (data.expectedSyncVersion !== currentVersion) {
			throw new PermitSyncError(permitSyncErrors.versionConflict)
		}

		if (
			existingPermit.syncStatus !== "in_progress" &&
			existingPermit.syncStatus !== "reopened"
		) {
			throw new PermitSyncError(permitSyncErrors.unavailable)
		}

		const syncVersion = (currentVersion ?? 0) + 1
		const syncAttemptId = data.syncAttemptId ?? crypto.randomUUID()
		const insertedAttempts = await tx
			.insert(permitSyncAttempts)
			.values({
				syncAttemptId,
				permitId: data.permit.id,
				version: syncVersion,
				payloadHash,
				submittedByUserId: userId,
				submittedAt: syncedAt,
			})
			.onConflictDoNothing({
				target: permitSyncAttempts.syncAttemptId,
			})
			.returning({
				syncAttemptId: permitSyncAttempts.syncAttemptId,
			})

		if (insertedAttempts.length === 0) {
			const previousAttempt = await tx.query.permitSyncAttempts.findFirst(
				{
					where: eq(permitSyncAttempts.syncAttemptId, syncAttemptId),
				},
			)
			const repeatedResult = resolveRepeatedSyncResult(
				previousAttempt,
				data.permit.id,
				userId,
				payloadHash,
			)
			if (repeatedResult) return repeatedResult

			throw new PermitSyncError(permitSyncErrors.attemptReadFailed)
		}

		await deletePermitChildData(data, tx)
		await insertPermitChildData(data, tx)
		await tx
			.update(permits)
			.set({
				syncStatus: "synced",
				syncedAt,
				updatedAt: new Date(),
			})
			.where(eq(permits.id, data.permit.id))

		return {
			permitId: data.permit.id,
			syncStatus: "synced",
			syncVersion,
			syncedAt: syncedAt.toISOString(),
		}
	})
}

function resolveRepeatedSyncResult(
	attempt: typeof permitSyncAttempts.$inferSelect | null | undefined,
	permitId: string,
	userId: string,
	payloadHash: string,
): PermitSyncResult | null {
	if (!attempt) return null
	if (
		attempt.permitId !== permitId ||
		attempt.submittedByUserId !== userId ||
		attempt.payloadHash !== payloadHash
	) {
		throw new PermitSyncError(permitSyncErrors.attemptMismatch)
	}

	return {
		permitId: attempt.permitId,
		syncStatus: "synced",
		syncVersion: attempt.version,
		syncedAt: attempt.submittedAt.toISOString(),
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
