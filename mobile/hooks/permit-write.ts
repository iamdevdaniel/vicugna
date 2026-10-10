import { fetchPermits, submitSyncFieldData } from "@api"
import {
	getFieldSyncData,
	savePermits,
	savePermitsReplacingOne,
	updatePermitSyncStatus,
} from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { BackendRequestError } from "../api/backend-request"

type PermitLoadResult = { ok: true } | { ok: false; error: string }
type SyncPermitResult =
	| { ok: true }
	| { ok: false; error: string; reason?: "outdated" }

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
	const [syncOperation, setSyncOperation] = useState<
		"upload" | "download" | null
	>(null)
	const [error, setError] = useState<string | null>(null)
	const operationRunning = useRef(false)
	const { token, userId } = useMobileAuthStore(
		useShallow((state) => ({
			token: state.token,
			userId: state.user?.id ?? null,
		})),
	)

	const syncPermit = useCallback(
		async (permitId: string): Promise<SyncPermitResult> => {
			if (operationRunning.current) {
				return { ok: false, error: "Ya hay una operación en curso" }
			}

			if (!token || !userId) {
				const message = "Debes iniciar sesión para enviar este permiso"
				setError(message)
				return { ok: false, error: message }
			}

			operationRunning.current = true
			setSyncOperation("upload")
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
					error instanceof BackendRequestError &&
					error.code === "SYNC_VERSION_CONFLICT"
						? { error: message, reason: "outdated" as const }
						: error instanceof BackendRequestError && error.code
							? {
									error: `${message} (${error.code})`,
								}
							: { error: message }
				setError(syncError.error)
				return { ok: false, ...syncError }
			} finally {
				operationRunning.current = false
				setSyncOperation(null)
			}
		},
		[token, userId],
	)

	const discardAndDownload = useCallback(
		async (permitId: string): Promise<PermitLoadResult> => {
			if (operationRunning.current) {
				return { ok: false, error: "Ya hay una operación en curso" }
			}
			if (!token || !userId) {
				return { ok: false, error: "Sesión no disponible" }
			}

			operationRunning.current = true
			setSyncOperation("download")
			try {
				const downloads = await fetchPermits(token)
				const download = downloads.find(
					({ permit }) => permit.id === permitId,
				)
				if (!download) {
					throw new Error("El permiso ya no está disponible")
				}

				await savePermitsReplacingOne(
					userId,
					downloads,
					download.permit.id,
				)
				return { ok: true }
			} catch (error) {
				return {
					ok: false,
					error:
						error instanceof Error
							? error.message
							: "No se pudieron descargar los datos actuales",
				}
			} finally {
				operationRunning.current = false
				setSyncOperation(null)
			}
		},
		[token, userId],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		syncPermit,
		discardAndDownload,
		syncingPermit: syncOperation !== null,
		syncOperation,
		error,
		clearError,
	}
}
