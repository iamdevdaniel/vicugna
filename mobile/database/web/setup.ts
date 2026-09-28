import type { ParticipantData, PermitData } from "@definitions/types"
import Dexie, { type EntityTable } from "dexie"

export type WebParticipantRecord = ParticipantData & {
	createdAt: number
}

export class WebFieldDatabase extends Dexie {
	permits!: EntityTable<PermitData, "id">
	participants!: EntityTable<WebParticipantRecord, "id">

	constructor(accountId: string) {
		if (!accountId.trim()) throw new Error("La cuenta local no es válida")

		super(`vicugna-field-${encodeURIComponent(accountId)}`)
		this.version(1).stores({
			permits: "id, permitNumber",
			participants: "id, permitId, createdAt",
		})
	}
}

const databases = new Map<string, WebFieldDatabase>()

export function getWebFieldDatabase(accountId: string): WebFieldDatabase {
	const existing = databases.get(accountId)
	if (existing) return existing

	const database = new WebFieldDatabase(accountId)
	databases.set(accountId, database)
	return database
}
