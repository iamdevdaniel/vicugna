import type { ParticipantData, PermitData } from "@definitions/types"
import Dexie, { type EntityTable } from "dexie"

export type WebPermitRecord = PermitData & {
	isActiveAssignmentUser: boolean
	syncVersion: number | null
}

export type WebParticipantRecord = ParticipantData & {
	createdAt: number
}

export type WebBackupFileHandle = {
	getFile: () => Promise<File>
	createWritable: () => Promise<{
		write: (contents: string) => Promise<void>
		close: () => Promise<void>
		abort?: () => Promise<void>
	}>
	queryPermission?: (options: {
		mode: "readwrite"
	}) => Promise<PermissionState>
	requestPermission?: (options: {
		mode: "readwrite"
	}) => Promise<PermissionState>
}

export type WebBackupSettingsRecord = {
	id: "backup"
	fileHandle: WebBackupFileHandle
	status: "pending" | "ready"
	revision: number
}

export class WebDatabase extends Dexie {
	permits!: EntityTable<WebPermitRecord, "id">
	participants!: EntityTable<WebParticipantRecord, "id">
	backupSettings!: EntityTable<WebBackupSettingsRecord, "id">

	constructor(accountId: string) {
		if (!accountId.trim()) throw new Error("La cuenta local no es válida")

		super(`vicugna-field-${encodeURIComponent(accountId)}`)
		this.version(1).stores({
			permits: "id, permitNumber",
			participants: "id, permitId, createdAt",
		})
		this.version(2).stores({
			permits: "id, permitNumber",
			participants: "id, permitId, createdAt",
			backupSettings: "id",
		})
	}
}

const databases = new Map<string, WebDatabase>()

export function getWebDatabase(accountId: string): WebDatabase {
	const existing = databases.get(accountId)
	if (existing) return existing

	const database = new WebDatabase(accountId)
	databases.set(accountId, database)
	return database
}

export function closeWebDatabase(accountId: string): void {
	const database = databases.get(accountId)
	if (!database) return

	database.close()
	databases.delete(accountId)
}

export async function openWebDatabase(accountId: string): Promise<void> {
	await getWebDatabase(accountId).open()
}
