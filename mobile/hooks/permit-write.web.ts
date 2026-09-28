import { fetchPermits } from "@api"
import {
	getWebSessionSnapshot,
	isWebSessionCurrent,
} from "@utils/auth-store.web"
import { useCallback, useRef, useState } from "react"
import { savePermitDownloads } from "../database/index.web"

type PermitLoadResult =
	| { ok: true }
	| { ok: false; error: string }
	| { ok: false; cancelled: true }

export function useLoadPermits() {
	const running = useRef(false)
	const [loadingPermits, setLoadingPermits] = useState(false)
	const loadPermits = useCallback(async (): Promise<PermitLoadResult> => {
		if (running.current) {
			return {
				ok: false,
				error: "La actualización de permisos ya está en curso",
			}
		}
		const session = getWebSessionSnapshot()
		if (!session) {
			return { ok: false, error: "Sesión no disponible" }
		}

		running.current = true
		setLoadingPermits(true)
		try {
			const downloads = await fetchPermits(session.token)
			if (!isWebSessionCurrent(session))
				return { ok: false, cancelled: true }

			await savePermitDownloads(session.accountId, downloads)
			if (!isWebSessionCurrent(session))
				return { ok: false, cancelled: true }

			return { ok: true }
		} catch (error) {
			if (!isWebSessionCurrent(session))
				return { ok: false, cancelled: true }

			return {
				ok: false,
				error:
					error instanceof Error
						? error.message
						: "No se pudieron cargar los permisos",
			}
		} finally {
			running.current = false
			setLoadingPermits(false)
		}
	}, [])

	return { loadPermits, loadingPermits }
}
