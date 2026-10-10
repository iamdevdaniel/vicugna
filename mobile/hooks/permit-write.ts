import { fetchPermits, submitSyncFieldData } from "@api"
import {
	getFieldSyncData,
	savePermits,
	updatePermitSyncStatus,
} from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { BackendRequestError } from "../api/backend-request"

type PermitLoadResult = { ok: true } | { ok: false; error: string }
type SyncPermitResult = { ok: true } | { ok: false; error: string }

export function useLoadPermits() {
	const [loadingPermits, setLoadingPermits] = useState(false)
	const isLoadRunning = useRef(false)
	const { token, userId } = useMobileAuthStore(
		useShallow((state) => ({
			token: state.token,
			userId: state.user?.id ?? null,
		})),
	)

	const loadPermits = useCallback(async (): Promise<PermitLoadResult> => {
		if (isLoadRunning.current) {
			return {
				ok: false,
				error: "La actualización de permisos ya está en curso",
			}
		}

		if (!token || !userId) {
			return { ok: false, error: "Sesión no disponible" }
		}

		isLoadRunning.current = true
		setLoadingPermits(true)

		try {
			const permits = await fetchPermits(token)
			await savePermits(userId, permits)
			return { ok: true }
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error.message
						: "No se pudieron cargar los permisos",
			}
		} finally {
			isLoadRunning.current = false
			setLoadingPermits(false)
		}
	}, [token, userId])

	return { loadPermits, loadingPermits }
}

export function useSyncPermit() {
	const [syncingPermit, setSyncingPermit] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { token, userId } = useMobileAuthStore(
		useShallow((state) => ({
			token: state.token,
			userId: state.user?.id ?? null,
		})),
	)

	const syncPermit = useCallback(
		async (permitId: string): Promise<SyncPermitResult> => {
			if (!token || !userId) {
				const message = "Debes iniciar sesión para enviar este permiso"
				setError(message)
				return { ok: false, error: message }
			}

			setSyncingPermit(true)
			setError(null)

			try {
				const payload = await getFieldSyncData(permitId, userId)
				const result = await submitSyncFieldData(token, payload)
				await updatePermitSyncStatus(result)
				return { ok: true }
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "No se pudo enviar el permiso"
				const syncError =
					error instanceof BackendRequestError && error.code
						? {
								error: `${message} (${error.code})`,
							}
						: { error: message }
				setError(syncError.error)
				return { ok: false, ...syncError }
			} finally {
				setSyncingPermit(false)
			}
		},
		[token, userId],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		syncPermit,
		syncingPermit,
		error,
		clearError,
	}
}
