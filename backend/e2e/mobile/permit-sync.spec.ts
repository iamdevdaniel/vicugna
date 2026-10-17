import { db } from "@db"
import { type APIRequestContext, expect, test } from "@playwright/test"
import type { MobilePermitData, PermitSyncResult, SyncFieldData } from "@shared"
import { eq } from "drizzle-orm"
import { assignments, permits } from "../../src/db/schema"
import {
	getPermitDataHash,
	PERMIT_DATA_HASH_VERSION,
} from "../../src/modules/permit-sync/permit-data-hash"

const userId = "user-seed-03"
const permitIds = {
	specific: "permit-e2e-hash-specific",
	untouched: "permit-e2e-hash-untouched",
	upload: "permit-e2e-hash-upload",
	conflict: "permit-e2e-hash-conflict",
} as const

test.describe.configure({ mode: "serial" })

test.beforeAll(async () => {
	await db.transaction(async (tx) => {
		for (const [index, permitId] of Object.values(permitIds).entries()) {
			await tx.insert(permits).values({
				id: permitId,
				seasonId: "season-2026",
				communityId: "atulcha",
				permitNumber: `HASH-E2E-${index + 1}`,
				syncStatus: "assigned",
			})
			await tx.insert(assignments).values({
				id: `assignment-${permitId}`,
				seasonId: "season-2026",
				communityId: "atulcha",
				userId,
				permitId,
			})
		}
	})
})

test("downloads one permit without changing another permit", async ({
	request,
}) => {
	const token = await login(request)
	const response = await request.get(
		`/mobile/permits/${permitIds.specific}`,
		{ headers: authorization(token) },
	)

	expect(response.status()).toBe(200)
	const body = (await response.json()) as {
		ok: true
		data: MobilePermitData
	}
	expect(body.data.permit.id).toBe(permitIds.specific)
	expect(body.data.fieldData).toBeNull()
	expect(body.data.serverHash).toBe(getPermitDataHash(null))
	expect(body.data.hashVersion).toBe(PERMIT_DATA_HASH_VERSION)

	const specificPermit = await db.query.permits.findFirst({
		where: eq(permits.id, permitIds.specific),
	})
	const untouchedPermit = await db.query.permits.findFirst({
		where: eq(permits.id, permitIds.untouched),
	})
	expect(specificPermit?.syncStatus).toBe("in_progress")
	expect(untouchedPermit?.syncStatus).toBe("assigned")

	const otherUserToken = await login(
		request,
		"rosa.condori@gmail.com",
		"e2e-rosa-password",
	)
	const forbiddenResponse = await request.get(
		`/mobile/permits/${permitIds.specific}`,
		{ headers: authorization(otherUserToken) },
	)
	expect(forbiddenResponse.status()).toBe(404)
})

test("bulk download returns matching hashes and starts assigned permits", async ({
	request,
}) => {
	const token = await login(request)
	const response = await request.get("/mobile/permits", {
		headers: authorization(token),
	})
	expect(response.status()).toBe(200)
	const body = (await response.json()) as {
		ok: true
		data: MobilePermitData[]
	}

	for (const permitId of Object.values(permitIds)) {
		const download = body.data.find((item) => item.permit.id === permitId)
		expect(download).toBeDefined()
		expect(download?.serverHash).toBe(
			getPermitDataHash(download?.fieldData ?? null),
		)
		expect(download?.hashVersion).toBe(PERMIT_DATA_HASH_VERSION)

		const storedPermit = await db.query.permits.findFirst({
			where: eq(permits.id, permitId),
		})
		expect(storedPermit?.syncStatus).toBe("in_progress")
	}
})

test("uploads changed data and confirms identical data without changing status", async ({
	request,
}) => {
	const token = await login(request)
	const download = await downloadPermit(request, token, permitIds.upload)
	const payload = makePayload(
		permitIds.upload,
		download.serverHash,
		"upload",
		"Datos guardados",
	)
	const otherUserToken = await login(
		request,
		"rosa.condori@gmail.com",
		"e2e-rosa-password",
	)
	const forbiddenResponse = await sendPermit(request, otherUserToken, payload)
	expect(forbiddenResponse.status()).toBe(403)
	await expect(forbiddenResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "PERMIT_SYNC_FORBIDDEN",
	})

	const invalidResponse = await sendPermit(request, token, {
		...payload,
		participants: [],
	})
	expect(invalidResponse.status()).toBe(400)
	await expect(invalidResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "VPRT_1",
	})

	const unchangedDownload = await downloadPermit(
		request,
		token,
		permitIds.upload,
	)
	expect(unchangedDownload.fieldData).toBeNull()

	const firstResponse = await sendPermit(request, token, payload)
	expect(firstResponse.status()).toBe(200)
	const firstResult = (await firstResponse.json()) as {
		ok: true
		data: PermitSyncResult
	}
	expect(firstResult.data).toMatchObject({
		permitId: permitIds.upload,
		syncStatus: "synced",
		serverHash: getPermitDataHash(payload),
		hashVersion: PERMIT_DATA_HASH_VERSION,
	})

	const unavailableResponse = await sendPermit(request, token, {
		...payload,
		baseHash: firstResult.data.serverHash,
		participants: [
			{ ...payload.participants[0], notes: "Cambio después del cierre" },
		],
	})
	expect(unavailableResponse.status()).toBe(409)
	await expect(unavailableResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "PERMIT_SYNC_UNAVAILABLE",
	})

	await db
		.update(permits)
		.set({ syncStatus: "reopened" })
		.where(eq(permits.id, permitIds.upload))

	const repeatedResponse = await sendPermit(request, token, payload)
	expect(repeatedResponse.status()).toBe(200)
	const repeatedResult = (await repeatedResponse.json()) as {
		ok: true
		data: PermitSyncResult
	}
	expect(repeatedResult.data.syncStatus).toBe("reopened")

	const storedPermit = await db.query.permits.findFirst({
		where: eq(permits.id, permitIds.upload),
	})
	expect(storedPermit?.syncStatus).toBe("reopened")
})

test("rejects two changed copies without replacing server data", async ({
	request,
}) => {
	const token = await login(request)
	const download = await downloadPermit(request, token, permitIds.conflict)
	const serverPayload = makePayload(
		permitIds.conflict,
		download.serverHash,
		"conflict",
		"Copia del servidor",
	)

	const firstResponse = await sendPermit(request, token, serverPayload)
	expect(firstResponse.status()).toBe(200)

	const conflictingPayload = {
		...serverPayload,
		participants: [
			{
				...serverPayload.participants[0],
				notes: "Copia del dispositivo",
			},
		],
	}
	const conflictResponse = await sendPermit(
		request,
		token,
		conflictingPayload,
	)
	expect(conflictResponse.status()).toBe(409)
	await expect(conflictResponse.json()).resolves.toMatchObject({
		ok: false,
		code: "SYNC_DATA_CONFLICT",
	})
	const storedPermit = await db.query.permits.findFirst({
		where: eq(permits.id, permitIds.conflict),
	})
	expect(storedPermit?.syncStatus).toBe("synced")

	const current = await downloadPermit(request, token, permitIds.conflict)
	expect(current.fieldData?.participants[0].notes).toBe("Copia del servidor")
})

test("rejects an unsupported hash version without changing data", async ({
	request,
}) => {
	const token = await login(request)
	const download = await downloadPermit(request, token, permitIds.untouched)
	const payload = makePayload(
		permitIds.untouched,
		download.serverHash,
		"version",
		"No debe guardarse",
	)

	const response = await sendPermit(request, token, {
		...payload,
		hashVersion: PERMIT_DATA_HASH_VERSION + 1,
	})
	expect(response.status()).toBe(400)
	await expect(response.json()).resolves.toMatchObject({
		ok: false,
		code: "SYNC_HASH_VERSION_UNSUPPORTED",
	})

	const current = await downloadPermit(request, token, permitIds.untouched)
	expect(current.fieldData).toBeNull()
})

async function login(
	request: APIRequestContext,
	email = "lucia.choque@gmail.com",
	password = "e2e-lucia-password",
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

function authorization(token: string) {
	return { Authorization: `Bearer ${token}` }
}

async function downloadPermit(
	request: APIRequestContext,
	token: string,
	permitId: string,
) {
	const response = await request.get(`/mobile/permits/${permitId}`, {
		headers: authorization(token),
	})
	expect(response.status()).toBe(200)
	const body = (await response.json()) as {
		ok: true
		data: MobilePermitData
	}
	expect(body.data.serverHash).toBe(getPermitDataHash(body.data.fieldData))
	return body.data
}

function sendPermit(
	request: APIRequestContext,
	token: string,
	payload: SyncFieldData,
) {
	return request.post("/permits/sync", {
		headers: authorization(token),
		data: payload,
	})
}

function makePayload(
	permitId: string,
	baseHash: string,
	recordSuffix: string,
	notes: string,
): SyncFieldData {
	const cleaningCommonId = `cleaning-common-e2e-${recordSuffix}`
	return {
		permitId,
		baseHash,
		hashVersion: PERMIT_DATA_HASH_VERSION,
		participants: [
			{
				id: `participant-e2e-${recordSuffix}`,
				permitId,
				name: "Participante",
				lastNames: "Hash E2E",
				gender: "F",
				identityNumber: "990001",
				signature: "firma-participante",
				notes,
			},
		],
		shearingHeader: {
			id: `shearing-header-e2e-${recordSuffix}`,
			permitId,
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
				permitId,
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
				observations: "Hash E2E",
			},
		],
		cleaningHeader: {
			id: `cleaning-header-e2e-${recordSuffix}`,
			permitId,
			startDate: "02/10/2026",
			endDate: "03/10/2026",
			site: "Centro E2E",
			supervisors: "Equipo E2E",
			isCompleted: true,
		},
		cleaningCommonRecords: [
			{
				id: cleaningCommonId,
				permitId,
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
