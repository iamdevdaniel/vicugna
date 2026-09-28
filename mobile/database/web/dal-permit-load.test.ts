import assert from "node:assert/strict"
import { test } from "node:test"
import type { MobilePermitData } from "@definitions/types"
import "fake-indexeddb/auto"
import { savePermitDownloads } from "./dal-permit-load"
import {
	closeWebFieldDatabase,
	getWebFieldDatabase,
	type WebPermitRecord,
} from "./setup"

function makeDownload(
	accountId: string,
	permitId: string,
	syncVersion: number | null = null,
): MobilePermitData {
	return {
		permit: {
			id: permitId,
			permitNumber: `PERMIT-${permitId}`,
			seasonId: "season",
			seasonName: "Temporada",
			communityId: "agua-rica",
			regionalId: "calacoto",
			departmentId: "la-paz",
			userId: accountId,
			userFullName: "Usuario PWA",
			isActiveAssignmentUser: true,
			syncStatus: "in_progress",
			syncedAt: null,
		},
		syncVersion,
		fieldData: null,
	}
}

test("permit downloads remain isolated by account and survive reopening", async () => {
	const firstAccountId = crypto.randomUUID()
	const secondAccountId = crypto.randomUUID()
	const firstPermitId = crypto.randomUUID()
	const secondPermitId = crypto.randomUUID()

	try {
		await savePermitDownloads(firstAccountId, [
			makeDownload(firstAccountId, firstPermitId),
		])
		await savePermitDownloads(secondAccountId, [
			makeDownload(secondAccountId, secondPermitId),
		])

		assert.ok(
			await getWebFieldDatabase(firstAccountId).permits.get(
				firstPermitId,
			),
		)
		assert.equal(
			await getWebFieldDatabase(firstAccountId).permits.get(
				secondPermitId,
			),
			undefined,
		)

		closeWebFieldDatabase(firstAccountId)
		assert.ok(
			await getWebFieldDatabase(firstAccountId).permits.get(
				firstPermitId,
			),
		)
	} finally {
		await getWebFieldDatabase(firstAccountId).delete()
		await getWebFieldDatabase(secondAccountId).delete()
	}
})

test("a download cannot cross the active account boundary", async () => {
	const activeAccountId = crypto.randomUUID()
	const otherAccountId = crypto.randomUUID()
	const database = getWebFieldDatabase(activeAccountId)

	try {
		await assert.rejects(
			savePermitDownloads(activeAccountId, [
				makeDownload(otherAccountId, crypto.randomUUID()),
			]),
			/does not belong|no pertenece/,
		)
		assert.equal(await database.permits.count(), 0)
	} finally {
		await database.delete()
	}
})

test("a newer server version does not overwrite unsynchronized local work", async () => {
	const accountId = crypto.randomUUID()
	const permitId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)

	try {
		const download = makeDownload(accountId, permitId, 1)
		await savePermitDownloads(accountId, [download])
		const local: WebPermitRecord = {
			...download.permit,
			permitNumber: "LOCAL-WORK",
			syncVersion: 1,
			participantsStatus: "done",
			shearingStatus: "ready",
			cleaningStatus: "disabled",
		}
		await database.permits.put(local)

		const newerDownload = makeDownload(accountId, permitId, 2)
		await savePermitDownloads(accountId, [newerDownload])

		assert.deepEqual(await database.permits.get(permitId), local)
	} finally {
		await database.delete()
	}
})

test("unsupported complete snapshots are rejected before writing", async () => {
	const accountId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)
	const download = makeDownload(accountId, crypto.randomUUID())
	download.fieldData = {} as MobilePermitData["fieldData"]

	try {
		await assert.rejects(
			savePermitDownloads(accountId, [download]),
			/previous data|datos anteriores/,
		)
		assert.equal(await database.permits.count(), 0)
	} finally {
		await database.delete()
	}
})

test("malformed downloads are rejected with a controlled error", async () => {
	const accountId = crypto.randomUUID()
	const database = getWebFieldDatabase(accountId)
	const malformedDownloads: unknown[] = [
		null,
		{},
		[null],
		[{ fieldData: null }],
	]

	try {
		for (const download of malformedDownloads) {
			await assert.rejects(
				savePermitDownloads(accountId, download),
				/servidor devolvió un permiso inválido/,
			)
		}
		assert.equal(await database.permits.count(), 0)
	} finally {
		await database.delete()
	}
})
