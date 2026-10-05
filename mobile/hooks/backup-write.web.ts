import {
	restoreBackupSnapshot,
	saveBackupFileHandle,
	type WebBackupFileHandle,
	writeBackup,
} from "@database/web"
import {
	getWebSessionSnapshot,
	isWebSessionCurrent,
	type WebSessionSnapshot,
} from "@utils/auth-store.web"
import { parseBackupFile } from "@utils/backup-file.web"
import { useCallback, useRef, useState } from "react"

export type BackupWritableFile = WebBackupFileHandle

type BackupResult =
	| { ok: true }
	| { ok: false; error: string }
	| { ok: false; cancelled: true }

export function useBackupActions() {
	const operationInFlight = useRef(false)
	const [working, setWorking] = useState(false)

	const run = useCallback(
		async (
			operation: (session: WebSessionSnapshot) => Promise<void>,
		): Promise<BackupResult> => {
			if (operationInFlight.current) {
				return { ok: false, error: "Ya hay una copia en proceso" }
			}
			const session = getWebSessionSnapshot()
			if (!session) return { ok: false, error: "Sesión no disponible" }

			operationInFlight.current = true
			setWorking(true)
			try {
				await operation(session)
				if (!isWebSessionCurrent(session)) {
					return { ok: false, cancelled: true }
				}
				return { ok: true }
			} catch (error) {
				if (!isWebSessionCurrent(session)) {
					return { ok: false, cancelled: true }
				}
				return {
					ok: false,
					error:
						error instanceof Error
							? error.message
							: "No se pudo procesar la copia",
				}
			} finally {
				operationInFlight.current = false
				setWorking(false)
			}
		},
		[],
	)

	const configureBackup = useCallback(
		(fileHandle: BackupWritableFile) =>
			run(async (session) => {
				if ((await fileHandle.getFile()).size > 0) {
					throw new Error(
						"El archivo ya contiene datos. Restáurelo o elija otro archivo",
					)
				}
				await saveBackupFileHandle(session.accountId, fileHandle)
				if (!isWebSessionCurrent(session)) return
				await writeBackup(session.accountId, false, () =>
					isWebSessionCurrent(session),
				)
			}),
		[run],
	)

	const retryBackup = useCallback(
		() =>
			run(async (session) => {
				await writeBackup(session.accountId, true, () =>
					isWebSessionCurrent(session),
				)
			}),
		[run],
	)

	const restoreBackup = useCallback(
		(fileHandle: BackupWritableFile) =>
			run(async (session) => {
				const snapshot = await parseBackupFile(
					await (await fileHandle.getFile()).text(),
				)
				if (!isWebSessionCurrent(session)) return
				await restoreBackupSnapshot(
					session.accountId,
					snapshot,
					fileHandle,
				)
			}),
		[run],
	)

	return {
		configureBackup,
		retryBackup,
		restoreBackup,
		working,
	}
}
