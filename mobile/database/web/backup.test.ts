import assert from "node:assert/strict"
import { afterEach, test } from "node:test"
import "fake-indexeddb/auto"
import { parseBackupFile, serializeBackupFile } from "@utils/backup-file.web"
import { readBackupSnapshot, restoreBackupSnapshot } from "./dal-backup"
import {
	closeWebDatabase,
	getWebDatabase,
	type WebBackupFileHandle,
} from "./setup"

const accountId = "backup-account"
const backupFileHandle = {} as WebBackupFileHandle

afterEach(async () => {
	await getWebDatabase(accountId).delete()
	closeWebDatabase(accountId)
	await getWebDatabase("other-account").delete()
	closeWebDatabase("other-account")
})

test("restores the account data from a backup", async () => {
	const database = getWebDatabase(accountId)
	await database.permits.add(makePermit(accountId, "permit-1", "TEST-01"))
	const backup = await createBackup(accountId)
	await database.permits.clear()

	await database.backupSettings.put({
		id: "backup",
		fileHandle: backupFileHandle,
		status: "pending",
		revision: 4,
	})
	await restoreBackupSnapshot(
		accountId,
		await parseBackupFile(backup),
		backupFileHandle,
	)

	assert.equal(
		(await database.permits.get("permit-1"))?.permitNumber,
		"TEST-01",
	)
	assert.deepEqual(await database.backupSettings.get("backup"), {
		id: "backup",
		fileHandle: backupFileHandle,
		status: "ready",
		revision: 5,
	})
})

test("rejects a damaged backup without replacing local data", async () => {
	const database = getWebDatabase(accountId)
	await database.permits.add(makePermit(accountId, "permit-1", "TEST-01"))
	const damaged = (await createBackup(accountId)).replace(
		"TEST-01",
		"DAMAGED",
	)

	await assert.rejects(
		async () =>
			restoreBackupSnapshot(
				accountId,
				await parseBackupFile(damaged),
				backupFileHandle,
			),
		/dañada/,
	)
	assert.equal(
		(await database.permits.get("permit-1"))?.permitNumber,
		"TEST-01",
	)
})

test("rejects another account backup without replacing local data", async () => {
	const database = getWebDatabase(accountId)
	await database.permits.add(makePermit(accountId, "permit-1", "TEST-01"))
	const backup = await createBackup(accountId)
	const otherDatabase = getWebDatabase("other-account")
	await otherDatabase.permits.add(
		makePermit("other-account", "other-permit", "OTHER-01"),
	)

	await assert.rejects(
		restoreBackupSnapshot(
			"other-account",
			await parseBackupFile(backup),
			backupFileHandle,
		),
		/otra cuenta/,
	)
	assert.equal(await otherDatabase.permits.count(), 1)
})

test("rejects incomplete records without replacing local data", async () => {
	const database = getWebDatabase(accountId)
	const validPermit = makePermit(accountId, "permit-1", "TEST-01")
	await database.permits.add(validPermit)
	const backup = await serializeBackupFile({
		version: 1,
		accountId,
		createdAt: new Date().toISOString(),
		permits: [validPermit],
		participants: [
			{
				id: "participant-1",
				permitId: "permit-1",
				lastNames: "Quispe Flores",
				gender: "F",
				identityNumber: "910001",
				signature: "signature",
				notes: "",
				createdAt: Date.now(),
			},
		],
	})

	await assert.rejects(
		restoreBackupSnapshot(
			accountId,
			await parseBackupFile(backup),
			backupFileHandle,
		),
		/datos inválidos/,
	)
	assert.deepEqual(await database.permits.get("permit-1"), validPermit)
	assert.equal(await database.participants.count(), 0)
})

async function createBackup(id: string): Promise<string> {
	return serializeBackupFile(await readBackupSnapshot(id))
}

function makePermit(account: string, id: string, permitNumber: string) {
	return {
		id,
		permitNumber,
		seasonId: "season-1",
		seasonName: "2026",
		communityId: "community-1",
		regionalId: "regional-1",
		departmentId: "department-1",
		userId: account,
		userFullName: "Test User",
		isActiveAssignmentUser: true,
		syncStatus: "in_progress" as const,
		syncedAt: null,
		syncVersion: 0,
		participantsStatus: "ready" as const,
		shearingStatus: "disabled" as const,
		cleaningStatus: "disabled" as const,
	}
}
