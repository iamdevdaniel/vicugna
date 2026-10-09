import type { MobilePermitData, PermitData } from "@definitions/types"
import { markBackupPending } from "./dal-backup"
import { getWebDatabase, type WebPermitRecord } from "./setup"

const syncStatuses = new Set<PermitData["syncStatus"]>([
	"created",
	"assigned",
	"in_progress",
	"synced",
	"reopened",
])

type LegacyWebPermitDownload = Omit<MobilePermitData, "permit"> & {
	permit: PermitData & { isActiveAssignmentUser: boolean }
}

export async function savePermitDownloads(
	accountId: string,
	value: unknown,
): Promise<void> {
	const downloads = parseDownloads(accountId, value)

	const database = getWebDatabase(accountId)
	await database.transaction(
		"rw",
		database.permits,
		database.backupSettings,
		async () => {
			for (const { permit, syncVersion } of downloads) {
				const existing = await database.permits.get(permit.id)
				const backendVersion = syncVersion ?? 0
				const localVersion = existing?.syncVersion ?? 0

				if (backendVersion < localVersion) continue
				if (
					existing &&
					existing.syncStatus !== "synced" &&
					backendVersion > localVersion
				) {
					continue
				}

				const record: WebPermitRecord = {
					...permit,
					syncVersion,
					participantsStatus: existing?.participantsStatus ?? "ready",
					shearingStatus: existing?.shearingStatus ?? "disabled",
					cleaningStatus: existing?.cleaningStatus ?? "disabled",
				}
				await database.permits.put(record)
			}
			await markBackupPending(database)
		},
	)
}

function parseDownloads(
	accountId: string,
	value: unknown,
): LegacyWebPermitDownload[] {
	if (!Array.isArray(value)) throwInvalidDownload()

	return value.map((download) => {
		if (!isRecord(download)) throwInvalidDownload()
		const permit = download.permit
		if (!isRecord(permit)) throwInvalidDownload()
		if (!("fieldData" in download)) throwInvalidDownload()
		if (download.fieldData !== null) {
			throw new Error(
				"Este permiso contiene datos anteriores que esta prueba web todavía no puede abrir",
			)
		}

		assertValidDownload(accountId, download, permit)
		return download as LegacyWebPermitDownload
	})
}

function assertValidDownload(
	accountId: string,
	download: Record<string, unknown>,
	permit: Record<string, unknown>,
): void {
	const { syncVersion } = download
	const requiredStrings = [
		permit.id,
		permit.permitNumber,
		permit.seasonId,
		permit.seasonName,
		permit.communityId,
		permit.regionalId,
		permit.departmentId,
		permit.userId,
		permit.userFullName,
	]

	if (
		requiredStrings.some(
			(value) => typeof value !== "string" || value.trim() === "",
		) ||
		typeof permit.isActiveAssignmentUser !== "boolean" ||
		typeof permit.syncStatus !== "string" ||
		!syncStatuses.has(permit.syncStatus as PermitData["syncStatus"]) ||
		(permit.syncedAt !== null && typeof permit.syncedAt !== "string") ||
		(syncVersion !== null &&
			(typeof syncVersion !== "number" ||
				!Number.isSafeInteger(syncVersion) ||
				syncVersion < 0))
	) {
		throwInvalidDownload()
	}

	if (permit.userId !== accountId || !permit.isActiveAssignmentUser) {
		throw new Error("El permiso no pertenece a la cuenta activa")
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function throwInvalidDownload(): never {
	throw new Error("El servidor devolvió un permiso inválido")
}
