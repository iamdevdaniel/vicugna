import { createHmac } from "node:crypto"
import { db } from "@db"
import { type APIRequestContext, expect, test } from "@playwright/test"
import type { PermitFieldData, PermitSyncResult, SyncFieldData } from "@shared"
import { eq } from "drizzle-orm"
import { assignments, permits, users } from "../../src/db/schema"
import { PERMIT_DATA_HASH_VERSION } from "../../src/modules/permit-sync/permit-data-hash"
import { downloadPermit, login, sendPermit } from "./permit-sync-test-helpers"

const userId = "user-seed-03"
const permitIds = {
	retry: "permit-e2e-sync-retry",
	replacement: "permit-e2e-sync-replacement",
	auth: "permit-e2e-sync-auth",
} as const

test.describe.configure({ mode: "serial" })

test.beforeAll(async () => {
	await db.transaction(async (tx) => {
		for (const [index, permitId] of Object.values(permitIds).entries()) {
			await tx.insert(permits).values({
				id: permitId,
				seasonId: "season-2026",
				communityId: "atulcha",
				permitNumber: `SYNC-SAFETY-${index + 1}`,
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

test("returns the existing sync result when the device retries after a lost response", async ({
	request,
}) => {
	const token = await login(request)
	const download = await downloadPermit(request, token, permitIds.retry)
	const payload = makePayload(
		permitIds.retry,
		download.serverHash,
		makeInitialSnapshot(permitIds.retry, "retry"),
	)

	const firstResult = await expectSuccessfulSync(request, token, payload)
	const retryResult = await expectSuccessfulSync(request, token, payload)

	expect(retryResult).toEqual(firstResult)
	expect(retryResult.syncStatus).toBe("synced")

	const stored = await downloadPermit(request, token, permitIds.retry)
	expect(normalizeFieldData(stored.fieldData)).toEqual(
		normalizeFieldData(fieldDataFromPayload(payload)),
	)
})

test("replaces a reopened permit with exactly the newly uploaded snapshot", async ({
	request,
}) => {
	const token = await login(request)
	const emptyDownload = await downloadPermit(
		request,
		token,
		permitIds.replacement,
	)
	const initialPayload = makePayload(
		permitIds.replacement,
		emptyDownload.serverHash,
		makeInitialSnapshot(permitIds.replacement, "replacement"),
	)
	await expectSuccessfulSync(request, token, initialPayload)

	await db
		.update(permits)
		.set({ syncStatus: "reopened" })
		.where(eq(permits.id, permitIds.replacement))

	const reopenedDownload = await downloadPermit(
		request,
		token,
		permitIds.replacement,
	)
	expect(normalizeFieldData(reopenedDownload.fieldData)).toEqual(
		normalizeFieldData(fieldDataFromPayload(initialPayload)),
	)

	const replacementPayload = makePayload(
		permitIds.replacement,
		reopenedDownload.serverHash,
		makeReplacementSnapshot(permitIds.replacement, "replacement"),
	)
	const replacementResult = await expectSuccessfulSync(
		request,
		token,
		replacementPayload,
	)
	expect(replacementResult.syncStatus).toBe("synced")
	expect(replacementResult.syncedAt).not.toBeNull()

	const finalDownload = await downloadPermit(
		request,
		token,
		permitIds.replacement,
	)
	expect(normalizeFieldData(finalDownload.fieldData)).toEqual(
		normalizeFieldData(fieldDataFromPayload(replacementPayload)),
	)
	expect(finalDownload.permit.syncStatus).toBe("synced")
	expect(finalDownload.permit.syncedAt).toBe(replacementResult.syncedAt)
})

test("rejects missing, invalid, expired, and deactivated-user authentication", async ({
	request,
}) => {
	const token = await login(request)
	const download = await downloadPermit(request, token, permitIds.auth)
	const payload = makePayload(
		permitIds.auth,
		download.serverHash,
		makeInitialSnapshot(permitIds.auth, "auth"),
	)

	await expectAllSyncEntryPointsUnauthorized(request, undefined, payload)
	await expectAllSyncEntryPointsUnauthorized(
		request,
		"Bearer not-a-valid-token",
		payload,
	)
	await expectAllSyncEntryPointsUnauthorized(
		request,
		`Bearer ${makeExpiredToken(token)}`,
		payload,
	)

	await db.update(users).set({ isActive: false }).where(eq(users.id, userId))
	try {
		await expectAllSyncEntryPointsUnauthorized(
			request,
			`Bearer ${token}`,
			payload,
		)
	} finally {
		await db
			.update(users)
			.set({ isActive: true })
			.where(eq(users.id, userId))
	}

	const unchanged = await downloadPermit(request, token, permitIds.auth)
	expect(unchanged.fieldData).toBeNull()
	expect(unchanged.permit.syncStatus).toBe("in_progress")
})

async function expectSuccessfulSync(
	request: APIRequestContext,
	token: string,
	payload: SyncFieldData,
) {
	const response = await sendPermit(request, token, payload)
	expect(response.status()).toBe(200)
	const body = (await response.json()) as {
		ok: true
		data: PermitSyncResult
	}
	return body.data
}

async function expectAllSyncEntryPointsUnauthorized(
	request: APIRequestContext,
	authorizationHeader: string | undefined,
	payload: SyncFieldData,
) {
	const headers = authorizationHeader
		? { Authorization: authorizationHeader }
		: undefined
	const responses = [
		await request.get("/mobile/permits", { headers }),
		await request.get(`/mobile/permits/${permitIds.auth}`, { headers }),
		await request.post("/permits/sync", { headers, data: payload }),
	]

	for (const response of responses) {
		expect(response.status()).toBe(401)
		await expect(response.json()).resolves.toMatchObject({ ok: false })
	}
}

function makeExpiredToken(validToken: string) {
	const secret = process.env.VICUGNA_MOBILE_AUTH_SECRET
	if (!secret) throw new Error("VICUGNA_MOBILE_AUTH_SECRET is required")

	const [encodedPayload, existingSignature] = validToken.split(".")
	if (!encodedPayload || !existingSignature) {
		throw new Error("The login endpoint returned an invalid mobile token")
	}
	const payload = JSON.parse(
		Buffer.from(encodedPayload, "base64url").toString("utf8"),
	) as Record<string, unknown>
	const expiredPayload = Buffer.from(
		JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) - 60 }),
	).toString("base64url")
	const signature = createHmac("sha256", secret)
		.update(expiredPayload)
		.digest("base64url")

	return `${expiredPayload}.${signature}`
}

function makePayload(
	permitId: string,
	baseHash: string,
	fieldData: PermitFieldData,
): SyncFieldData {
	return {
		permitId,
		baseHash,
		hashVersion: PERMIT_DATA_HASH_VERSION,
		...fieldData,
	}
}

function fieldDataFromPayload(payload: SyncFieldData): PermitFieldData {
	return {
		participants: payload.participants,
		shearingHeader: payload.shearingHeader,
		shearingRecords: payload.shearingRecords,
		cleaningHeader: payload.cleaningHeader,
		cleaningCommonRecords: payload.cleaningCommonRecords,
		groomingDetails: payload.groomingDetails,
		dehearingDetails: payload.dehearingDetails,
	}
}

function normalizeFieldData(fieldData: PermitFieldData | null) {
	if (!fieldData) return null

	return {
		...fieldData,
		participants: [...fieldData.participants].sort(compareIds),
		shearingRecords: [...fieldData.shearingRecords].sort(compareIds),
		cleaningCommonRecords: [...fieldData.cleaningCommonRecords].sort(
			compareIds,
		),
		groomingDetails: [...fieldData.groomingDetails].sort(compareIds),
		dehearingDetails: [...fieldData.dehearingDetails].sort(compareIds),
	}
}

function compareIds(left: { id: string }, right: { id: string }) {
	return left.id.localeCompare(right.id)
}

function makeInitialSnapshot(
	permitId: string,
	prefix: string,
): PermitFieldData {
	const removedCleaningId = `${prefix}-cleaning-removed`
	const retainedCleaningId = `${prefix}-cleaning-retained`

	return {
		participants: [
			makeParticipant(
				`${prefix}-participant-removed`,
				permitId,
				"910001",
				"Se elimina",
			),
			makeParticipant(
				`${prefix}-participant-retained`,
				permitId,
				"910002",
				"Versión inicial",
			),
		],
		shearingHeader: makeShearingHeader(
			`${prefix}-shearing-header-initial`,
			permitId,
			"Corral inicial",
		),
		shearingRecords: [
			makeShearingRecord(`${prefix}-shearing-removed`, permitId, 910001),
			makeShearingRecord(`${prefix}-shearing-retained`, permitId, 910002),
		],
		cleaningHeader: makeCleaningHeader(
			`${prefix}-cleaning-header-initial`,
			permitId,
			"Centro inicial",
		),
		cleaningCommonRecords: [
			makeCleaningCommon(removedCleaningId, permitId, "910001", 3200),
			makeCleaningCommon(retainedCleaningId, permitId, "910002", 3500),
		],
		groomingDetails: [
			makeGrooming(`${prefix}-grooming-removed`, removedCleaningId, 2400),
		],
		dehearingDetails: [
			makeDehearing(
				`${prefix}-dehearing-retained`,
				retainedCleaningId,
				2500,
			),
		],
	}
}

function makeReplacementSnapshot(
	permitId: string,
	prefix: string,
): PermitFieldData {
	const retainedCleaningId = `${prefix}-cleaning-retained`
	const addedCleaningId = `${prefix}-cleaning-added`

	return {
		participants: [
			makeParticipant(
				`${prefix}-participant-retained`,
				permitId,
				"910002",
				"Versión reemplazada",
			),
			makeParticipant(
				`${prefix}-participant-added`,
				permitId,
				"910003",
				"Se agrega",
			),
		],
		shearingHeader: makeShearingHeader(
			`${prefix}-shearing-header-replacement`,
			permitId,
			"Corral reemplazado",
		),
		shearingRecords: [
			makeShearingRecord(`${prefix}-shearing-retained`, permitId, 910002),
			makeShearingRecord(`${prefix}-shearing-added`, permitId, 910003),
		],
		cleaningHeader: makeCleaningHeader(
			`${prefix}-cleaning-header-replacement`,
			permitId,
			"Centro reemplazado",
		),
		cleaningCommonRecords: [
			makeCleaningCommon(retainedCleaningId, permitId, "910002", 3600),
			makeCleaningCommon(addedCleaningId, permitId, "910003", 3300),
		],
		groomingDetails: [
			makeGrooming(`${prefix}-grooming-added`, addedCleaningId, 2500),
		],
		dehearingDetails: [
			makeDehearing(
				`${prefix}-dehearing-retained`,
				retainedCleaningId,
				2600,
			),
		],
	}
}

function makeParticipant(
	id: string,
	permitId: string,
	identityNumber: string,
	notes: string,
) {
	return {
		id,
		permitId,
		name: "Participante",
		lastNames: "Prueba adversarial",
		gender: "F" as const,
		identityNumber,
		signature: "firma-participante",
		notes,
	}
}

function makeShearingHeader(id: string, permitId: string, site: string) {
	return {
		id,
		permitId,
		site,
		latitude: -19.5,
		longitude: -65.75,
		roundupCount: 2,
		eventDate: "01/10/2026",
		startTime: "08:00",
		endTime: "10:00",
		isCompleted: true,
	}
}

function makeShearingRecord(id: string, permitId: string, tagNumber: number) {
	return {
		id,
		permitId,
		tagNumber,
		sex: "F" as const,
		ageCategory: "Adulto" as const,
		liveWeight: 42.5,
		fiberLength: 4.8,
		bodyCondition: "Bueno" as const,
		gestationStatus: "No" as const,
		externalParasites: [],
		mangeSeverity: "Ninguna" as const,
		hasDandruff: false,
		isSheared: true,
		isDead: false,
		observations: id,
	}
}

function makeCleaningHeader(id: string, permitId: string, site: string) {
	return {
		id,
		permitId,
		startDate: "02/10/2026",
		endDate: "03/10/2026",
		site,
		supervisors: "Equipo E2E",
		isCompleted: true,
	}
}

function makeCleaningCommon(
	id: string,
	permitId: string,
	fleeceNumber: string,
	grossWeight: number,
) {
	return { id, permitId, fleeceNumber, grossWeight }
}

function makeGrooming(
	id: string,
	cleaningCommonId: string,
	cleanWeight: number,
) {
	return {
		id,
		cleaningCommonId,
		cleanWeight,
		dirtyWeight: 500,
		totalWeight: cleanWeight + 500,
		isCompleted: true,
	}
}

function makeDehearing(
	id: string,
	cleaningCommonId: string,
	dehairedWeight: number,
) {
	return {
		id,
		cleaningCommonId,
		dehairedWeight,
		bristleWeight: 300,
		hasDandruff: false,
		dehairerName: "Responsable E2E",
		signature: "firma-responsable",
		isCompleted: true,
	}
}
