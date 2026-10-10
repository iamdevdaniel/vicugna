import type { ParticipantData } from "@definitions/types"
import { serializeBackupFile } from "@utils/backup-file.web"
import { liveQuery } from "dexie"
import {
	getWebDatabase,
	type WebBackupFileHandle,
	type WebBackupSettingsRecord,
	type WebDatabase,
	type WebPermitRecord,
} from "./setup"

const BACKUP_VERSION = 1
const permitSyncStatuses = new Set([
	"created",
	"assigned",
	"in_progress",
	"synced",
	"reopened",
])
const permitStepStatuses = new Set(["ready", "done", "disabled"])
const participantGenders = new Set(["M", "F"])

// Backup requests run one at a time per account. Each write captures the
// current database revision and full snapshot. If another database write
// changes the revision before the file finishes, the latest snapshot is
// written again before the backup is marked ready.
const backupQueueTails = new Map<string, Promise<void>>()

export type WebBackupSnapshot = {
	version: typeof BACKUP_VERSION
	accountId: string
	createdAt: string
	permits: WebPermitRecord[]
	participants: Array<ParticipantData & { createdAt: number }>
}

/* ---------- BACKUP CONFIGURATION ---------- */

type SubscriptionCallbacks = {
	onChange: (settings: WebBackupSettingsRecord | null) => void
	onError: (error: Error) => void
}

export function subscribeBackupSettings(
	accountId: string,
	callbacks: SubscriptionCallbacks,
): () => void {
	const database = getWebDatabase(accountId)
	const subscription = liveQuery(
		async () => (await database.backupSettings.get("backup")) ?? null,
	).subscribe({
		next: callbacks.onChange,
		error: (error) => callbacks.onError(error as Error),
	})

	return () => subscription.unsubscribe()
}

export async function saveBackupFileHandle(
	accountId: string,
	fileHandle: WebBackupFileHandle,
): Promise<void> {
	const database = getWebDatabase(accountId)
	await database.transaction("rw", database.backupSettings, async () => {
		const current = await database.backupSettings.get("backup")
		await database.backupSettings.put({
			id: "backup",
			fileHandle,
			status: "pending",
			revision: getBackupRevision(current) + 1,
		})
	})
}

export async function markBackupPending(database: WebDatabase): Promise<void> {
	const settings = await database.backupSettings.get("backup")
	if (!settings) return

	await database.backupSettings.update("backup", {
		status: "pending",
		revision: getBackupRevision(settings) + 1,
	})
}

/* ---------- BACKUP WRITING ---------- */

export async function writeBackup(
	accountId: string,
	requestPermission: boolean,
	shouldContinue: () => boolean,
): Promise<"ready" | "unconfigured" | "cancelled"> {
	const previous = backupQueueTails.get(accountId) ?? Promise.resolve()
	const operation = previous
		.catch(() => undefined)
		.then(() =>
			writeLatestBackup(accountId, requestPermission, shouldContinue),
		)
	const tail = operation.then(
		() => undefined,
		() => undefined,
	)
	backupQueueTails.set(accountId, tail)
	void tail.finally(() => {
		if (backupQueueTails.get(accountId) === tail) {
			backupQueueTails.delete(accountId)
		}
	})

	return operation
}

async function writeLatestBackup(
	accountId: string,
	requestPermission: boolean,
	shouldContinue: () => boolean,
): Promise<"ready" | "unconfigured" | "cancelled"> {
	const database = getWebDatabase(accountId)

	while (shouldContinue()) {
		const captured = await captureBackup(database, accountId)
		if (!shouldContinue()) return "cancelled"
		if (!captured) return "unconfigured"

		await ensureWritePermission(captured.fileHandle, requestPermission)
		if (!shouldContinue()) return "cancelled"
		const contents = await serializeBackupFile(captured.snapshot)
		if (!shouldContinue()) return "cancelled"
		const writable = await captured.fileHandle.createWritable()
		try {
			await writable.write(contents)
			await writable.close()
		} catch (error) {
			try {
				await writable.abort?.()
			} catch {
				// Preserve the original write failure.
			}
			throw error
		}
		if (!shouldContinue()) return "cancelled"

		const isCurrent = await markBackupReadyIfCurrent(
			database,
			captured.revision,
		)
		if (isCurrent) return "ready"
	}

	return "cancelled"
}

export async function readBackupSnapshot(
	accountId: string,
): Promise<WebBackupSnapshot> {
	const database = getWebDatabase(accountId)
	return database.transaction(
		"r",
		database.permits,
		database.participants,
		() => readSnapshot(database, accountId),
	)
}

async function captureBackup(
	database: WebDatabase,
	accountId: string,
): Promise<
	| {
			revision: number
			fileHandle: WebBackupFileHandle
			snapshot: WebBackupSnapshot
	  }
	| undefined
> {
	return database.transaction(
		"r",
		database.backupSettings,
		database.permits,
		database.participants,
		async () => {
			const settings = await database.backupSettings.get("backup")
			if (!settings) return undefined

			return {
				revision: getBackupRevision(settings),
				fileHandle: settings.fileHandle,
				snapshot: await readSnapshot(database, accountId),
			}
		},
	)
}

async function readSnapshot(
	database: WebDatabase,
	accountId: string,
): Promise<WebBackupSnapshot> {
	const [permits, participants] = await Promise.all([
		database.permits.toArray(),
		database.participants.toArray(),
	])

	return {
		version: BACKUP_VERSION,
		accountId,
		createdAt: new Date().toISOString(),
		permits,
		participants,
	}
}

async function markBackupReadyIfCurrent(
	database: WebDatabase,
	revision: number,
): Promise<boolean> {
	return database.transaction("rw", database.backupSettings, async () => {
		const current = await database.backupSettings.get("backup")
		if (!current || getBackupRevision(current) !== revision) return false

		await database.backupSettings.update("backup", { status: "ready" })
		return true
	})
}

function getBackupRevision(
	settings: Pick<WebBackupSettingsRecord, "revision"> | undefined,
): number {
	if (!settings || !Number.isSafeInteger(settings.revision)) return 0
	return settings.revision >= 0 ? settings.revision : 0
}

/* ---------- SNAPSHOT RESTORE ---------- */

export async function restoreBackupSnapshot(
	accountId: string,
	value: unknown,
	fileHandle: WebBackupFileHandle,
): Promise<void> {
	assertBackupSnapshot(value)
	if (value.accountId !== accountId) {
		throw new Error("La copia pertenece a otra cuenta")
	}
	if (value.permits.some((permit) => permit.userId !== accountId)) {
		throw new Error("La copia contiene permisos de otra cuenta")
	}

	const database = getWebDatabase(accountId)
	await database.transaction(
		"rw",
		database.permits,
		database.participants,
		database.backupSettings,
		async () => {
			const currentSettings = await database.backupSettings.get("backup")
			await database.participants.clear()
			await database.permits.clear()
			await database.permits.bulkAdd(value.permits)
			await database.participants.bulkAdd(value.participants)
			await database.backupSettings.put({
				id: "backup",
				fileHandle,
				status: "ready",
				revision: getBackupRevision(currentSettings) + 1,
			})
		},
	)
}

/* ---------- BACKUP VALIDATION ---------- */

function assertBackupSnapshot(
	value: unknown,
): asserts value is WebBackupSnapshot {
	if (
		!isRecord(value) ||
		value.version !== BACKUP_VERSION ||
		typeof value.accountId !== "string" ||
		value.accountId.trim() === "" ||
		typeof value.createdAt !== "string" ||
		Number.isNaN(Date.parse(value.createdAt)) ||
		!Array.isArray(value.permits) ||
		!Array.isArray(value.participants) ||
		!value.permits.every(isStoredPermit) ||
		!value.participants.every(isStoredParticipant)
	) {
		throw new Error("La copia contiene datos inválidos")
	}

	const permitIds = new Set(value.permits.map((permit) => permit.id))
	if (
		permitIds.size !== value.permits.length ||
		new Set(value.participants.map((participant) => participant.id))
			.size !== value.participants.length ||
		value.participants.some(
			(participant) => !permitIds.has(participant.permitId),
		)
	) {
		throw new Error("La copia contiene datos inválidos")
	}
}

function isStoredPermit(value: unknown): value is WebPermitRecord {
	return (
		isRecord(value) &&
		isNonEmptyString(value.id) &&
		isNonEmptyString(value.permitNumber) &&
		isNonEmptyString(value.seasonId) &&
		isNonEmptyString(value.seasonName) &&
		isNonEmptyString(value.communityId) &&
		isNonEmptyString(value.regionalId) &&
		isNonEmptyString(value.departmentId) &&
		isNonEmptyString(value.userId) &&
		isNonEmptyString(value.userFullName) &&
		typeof value.syncStatus === "string" &&
		permitSyncStatuses.has(value.syncStatus) &&
		(value.syncedAt === null ||
			(isNonEmptyString(value.syncedAt) &&
				!Number.isNaN(Date.parse(value.syncedAt)))) &&
		typeof value.participantsStatus === "string" &&
		permitStepStatuses.has(value.participantsStatus) &&
		typeof value.shearingStatus === "string" &&
		permitStepStatuses.has(value.shearingStatus) &&
		typeof value.cleaningStatus === "string" &&
		permitStepStatuses.has(value.cleaningStatus) &&
		(value.syncVersion === null ||
			(typeof value.syncVersion === "number" &&
				Number.isSafeInteger(value.syncVersion) &&
				value.syncVersion >= 0))
	)
}

function isStoredParticipant(
	value: unknown,
): value is ParticipantData & { createdAt: number } {
	return (
		isRecord(value) &&
		isNonEmptyString(value.id) &&
		isNonEmptyString(value.permitId) &&
		isNonEmptyString(value.name) &&
		isNonEmptyString(value.lastNames) &&
		typeof value.gender === "string" &&
		participantGenders.has(value.gender) &&
		isNonEmptyString(value.identityNumber) &&
		/^\d+$/.test(value.identityNumber) &&
		Number(value.identityNumber) > 0 &&
		isNonEmptyString(value.signature) &&
		typeof value.notes === "string" &&
		typeof value.createdAt === "number" &&
		Number.isSafeInteger(value.createdAt) &&
		value.createdAt >= 0
	)
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim() !== ""
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

/* ---------- FILE PERMISSION ---------- */

async function ensureWritePermission(
	fileHandle: WebBackupFileHandle,
	requestPermission: boolean,
): Promise<void> {
	if (!fileHandle.queryPermission) return

	const options = { mode: "readwrite" as const }
	let permission = await fileHandle.queryPermission(options)
	if (
		permission !== "granted" &&
		requestPermission &&
		fileHandle.requestPermission
	) {
		permission = await fileHandle.requestPermission(options)
	}
	if (permission !== "granted") {
		throw new Error("Autorice nuevamente el archivo de copia")
	}
}
