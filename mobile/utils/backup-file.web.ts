const BACKUP_FORMAT = "vicugna-field-backup"
const BACKUP_VERSION = 1

type BackupFile = {
	format: typeof BACKUP_FORMAT
	version: typeof BACKUP_VERSION
	payload: unknown
	checksum: string
}

export async function serializeBackupFile(payload: unknown): Promise<string> {
	return JSON.stringify({
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		payload,
		checksum: await sha256(JSON.stringify(payload)),
	} satisfies BackupFile)
}

export async function parseBackupFile(contents: string): Promise<unknown> {
	let value: unknown
	try {
		value = JSON.parse(contents)
	} catch {
		throw new Error("El archivo de copia no es válido")
	}

	assertBackupFile(value)
	if ((await sha256(JSON.stringify(value.payload))) !== value.checksum) {
		throw new Error("La copia está dañada")
	}

	return value.payload
}

function assertBackupFile(value: unknown): asserts value is BackupFile {
	if (
		!isRecord(value) ||
		value.format !== BACKUP_FORMAT ||
		value.version !== BACKUP_VERSION ||
		!("payload" in value) ||
		typeof value.checksum !== "string"
	) {
		throw new Error("El archivo de copia no es válido")
	}
}

async function sha256(value: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	)
	return bytesToBase64(new Uint8Array(digest))
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = ""
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return btoa(binary)
}
