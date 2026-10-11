import { db } from "@db"
import { type APIRequestContext, expect, test } from "@playwright/test"
import type { MobilePermitData, PermitSyncResult, SyncFieldData } from "@shared"
import { assignments, permits } from "../../src/db/schema"

const permitId = "permit-e2e-sync-attempt"
const syncAttemptId = "7f60746e-aad6-4f1f-9d79-e7782c008f17"
const concurrentPermitIds = [
	"permit-e2e-sync-attempt-concurrent-a",
	"permit-e2e-sync-attempt-concurrent-b",
] as const
const concurrentSyncAttemptId = "a324a16f-54e1-48b9-85b9-7d3ca237a4e3"

test.beforeAll(async () => {
	await db.transaction(async (tx) => {
		await tx.insert(permits).values({
			id: permitId,
			seasonId: "season-2026",
			communityId: "atulcha",
			permitNumber: "SYNC-ATTEMPT-E2E",
			syncStatus: "assigned",
		})
		await tx.insert(assignments).values({
			id: "assignment-e2e-sync-attempt",
			seasonId: "season-2026",
			communityId: "atulcha",
			userId: "user-seed-03",
			permitId,
		})
		for (const [
			index,
			concurrentPermitId,
		] of concurrentPermitIds.entries()) {
			await tx.insert(permits).values({
				id: concurrentPermitId,
				seasonId: "season-2026",
				communityId: "atulcha",
				permitNumber: `SYNC-CONCURRENT-${index + 1}`,
				syncStatus: "assigned",
			})
			await tx.insert(assignments).values({
				id: `assignment-${concurrentPermitId}`,
				seasonId: "season-2026",
				communityId: "atulcha",
				userId: "user-seed-03",
				permitId: concurrentPermitId,
			})
		}
	})
})

test("recognizes an exact retry and rejects changed data", async ({
	request,
}) => {
	const token = await login(
		request,
		"lucia.choque@gmail.com",
		"e2e-lucia-password",
	)
	const otherUserToken = await login(
		request,
		"rosa.condori@gmail.com",
		"e2e-rosa-password",
	)
	const downloadResponse = await request.get("/mobile/permits", {
		headers: { Authorization: `Bearer ${token}` },
	})
	expect(downloadResponse.ok()).toBe(true)
	const downloads = (await downloadResponse.json()) as {
		ok: true
		data: MobilePermitData[]
	}
	const download = downloads.data.find(({ permit }) => permit.id === permitId)
	expect(download).toBeDefined()

	const payload = makePayload(download?.permit)
	const firstResponse = await sendPermit(request, token, payload)
	expect(firstResponse.status()).toBe(200)
	const firstResult = (await firstResponse.json()) as {
		ok: true
		data: PermitSyncResult
	}
	expect(firstResult.data.syncVersion).toBe(1)

	const retryResponse = await sendPermit(request, token, payload)
	expect(retryResponse.status()).toBe(200)
	const retryResult = (await retryResponse.json()) as {
		ok: true
		data: PermitSyncResult
	}
	expect(retryResult.data).toEqual(firstResult.data)

	const changedResponse = await sendPermit(request, token, {
		...payload,
		participants: [{ ...payload.participants[0], notes: "Dato cambiado" }],
	})
	expect(changedResponse.status()).toBe(409)
	await expect(changedResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "SYNC_ATTEMPT_CONFLICT",
	})

	const otherUserResponse = await sendPermit(request, otherUserToken, payload)
	expect(otherUserResponse.status()).toBe(409)
	await expect(otherUserResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "SYNC_ATTEMPT_CONFLICT",
	})

	const refreshedResponse = await request.get("/mobile/permits", {
		headers: { Authorization: `Bearer ${token}` },
	})
	const refreshed = (await refreshedResponse.json()) as {
		ok: true
		data: MobilePermitData[]
	}
	const savedPermit = refreshed.data.find(
		({ permit }) => permit.id === permitId,
	)
	expect(savedPermit?.syncVersion).toBe(1)
	expect(savedPermit?.fieldData?.participants[0].notes).toBe("Original")

	const concurrentPermits = concurrentPermitIds.map((concurrentPermitId) => {
		const concurrentPermit = downloads.data.find(
			({ permit }) => permit.id === concurrentPermitId,
		)?.permit
		return makePayload(
			concurrentPermit,
			concurrentSyncAttemptId,
			concurrentPermitId,
		)
	})
	const concurrentResponses = await Promise.all(
		concurrentPermits.map((concurrentPayload) =>
			sendPermit(request, token, concurrentPayload),
		),
	)

	expect(
		concurrentResponses.map((response) => response.status()).sort(),
	).toEqual([200, 409])
	const conflictResponse = concurrentResponses.find(
		(response) => response.status() === 409,
	)
	if (!conflictResponse)
		throw new Error("No se recibió el conflicto esperado")
	await expect(conflictResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "SYNC_ATTEMPT_CONFLICT",
	})
})

async function login(
	request: APIRequestContext,
	email: string,
	password: string,
) {
	const response = await request.post("/mobile/auth/login", {
		data: { email, password },
	})
	expect(response.ok()).toBe(true)
	const body = (await response.json()) as {
		ok: true
		data: { token: string }
	}
	return body.data.token
}

function sendPermit(
	request: APIRequestContext,
	token: string,
	payload: SyncFieldData,
) {
	return request.post("/permits/sync", {
		headers: { Authorization: `Bearer ${token}` },
		data: payload,
	})
}

function makePayload(
	permit: MobilePermitData["permit"] | undefined,
	attemptId = syncAttemptId,
	recordSuffix = "sync-attempt",
): SyncFieldData {
	if (!permit) throw new Error("No se encontró el permiso E2E")

	const payloadPermitId = permit.id
	const cleaningCommonId = `cleaning-common-e2e-${recordSuffix}`
	return {
		syncAttemptId: attemptId,
		expectedSyncVersion: null,
		permit,
		participants: [
			{
				id: `participant-e2e-${recordSuffix}`,
				permitId: payloadPermitId,
				name: "Participante",
				lastNames: "Intento E2E",
				gender: "F",
				identityNumber: "990001",
				signature: "firma-participante",
				notes: "Original",
			},
		],
		shearingHeader: {
			id: `shearing-header-e2e-${recordSuffix}`,
			permitId: payloadPermitId,
			site: "Corral E2E",
			latitude: -19.5,
			longitude: -65.75,
			roundupCount: 1,
			eventDate: "01/10/2026",
			startTime: "08:00",
			endTime: "10:00",
			isCompleted: true,
		},
		shearingRecords: [
			{
				id: `shearing-record-e2e-${recordSuffix}`,
				permitId: payloadPermitId,
				tagNumber: 990001,
				sex: "F",
				ageCategory: "Adulto",
				liveWeight: 42.5,
				fiberLength: 4.8,
				bodyCondition: "Bueno",
				gestationStatus: "No",
				externalParasites: [],
				mangeSeverity: "Ninguna",
				hasDandruff: false,
				isSheared: true,
				isDead: false,
				observations: "Intento E2E",
			},
		],
		cleaningHeader: {
			id: `cleaning-header-e2e-${recordSuffix}`,
			permitId: payloadPermitId,
			startDate: "02/10/2026",
			endDate: "03/10/2026",
			site: "Centro E2E",
			supervisors: "Equipo E2E",
			isCompleted: true,
		},
		cleaningCommonRecords: [
			{
				id: cleaningCommonId,
				permitId: payloadPermitId,
				fleeceNumber: "990001",
				grossWeight: 3200,
			},
		],
		groomingDetails: [
			{
				id: `grooming-e2e-${recordSuffix}`,
				cleaningCommonId,
				cleanWeight: 2400,
				dirtyWeight: 500,
				totalWeight: 2900,
				isCompleted: true,
			},
		],
		dehearingDetails: [],
	}
}
