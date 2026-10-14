import { fetchPermits, submitSyncFieldData } from "@api"
import {
	clearPermitSyncAttempt,
	completePermitSyncAttempt,
	getFieldSyncData,
	savePermits,
	startPermitSyncAttempt,
} from "@database"
import { useMobileAuthStore } from "@utils/auth-store"
import { useCallback, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { BackendRequestError } from "../api/backend-request"

type PermitLoadResult = { ok: true } | { ok: false; error: string }
type SyncPermitResult =
	| { ok: true; warning?: string }
	| { ok: false; error: string; reason?: "outdated" | "pending" }

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
			let responseReceived = false
			let attemptStarted = false

			try {
				await startPermitSyncAttempt(permitId, userId)
				attemptStarted = true
				const payload = await getFieldSyncData(permitId, userId)
				const result = await submitSyncFieldData(token, payload)
				responseReceived = true
				await completePermitSyncAttempt(result, userId)
				return { ok: true }
			} catch (caught) {
				let mustKeepAttempt =
					responseReceived || isUncertainRequestFailure(caught)

				if (!mustKeepAttempt && attemptStarted) {
					try {
						await clearPermitSyncAttempt(permitId, userId)
					} catch {
						mustKeepAttempt = true
					}
				}

				const message =
					caught instanceof Error
						? caught.message
						: "No se pudo enviar el permiso"
				const syncError = mustKeepAttempt
					? {
							error: "No se pudo confirmar el envío. Reintente para conocer el resultado.",
							reason: "pending" as const,
						}
					: caught instanceof BackendRequestError &&
							caught.code === "SYNC_VERSION_CONFLICT"
						? { error: message, reason: "outdated" as const }
						: caught instanceof BackendRequestError && caught.code
							? {
									error: `${message} (${caught.code})`,
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

	const retrySyncPermit = useCallback(
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
				await completePermitSyncAttempt(result, userId)

				try {
					const downloads = await fetchPermits(token)
					const permitWasDownloaded = downloads.some(
						({ permit }) => permit.id === permitId,
					)
					if (!permitWasDownloaded) {
						throw new Error("El permiso ya no está disponible")
					}
					await savePermits(userId, downloads)
				} catch {
					return {
						ok: true,
						warning:
							"El envío se confirmó, pero no se pudieron descargar los datos actuales.",
					}
				}

				return { ok: true }
			} catch (caught) {
				const retryNeedsLogin =
					caught instanceof BackendRequestError &&
					caught.status === 401
				const unresolvedAttempt = retryNeedsLogin
					? {
							error: "Tu sesión terminó. Inicia sesión y vuelve a intentar el envío.",
							reason: "pending" as const,
						}
					: {
							error: "No se pudo confirmar el envío. Reintente para conocer el resultado.",
							reason: "pending" as const,
						}

				if (!isSafeToClearSyncAttemptAfterRetry(caught)) {
					setError(unresolvedAttempt.error)
					return { ok: false, ...unresolvedAttempt }
				}

				try {
					await clearPermitSyncAttempt(permitId, userId)
				} catch {
					setError(unresolvedAttempt.error)
					return { ok: false, ...unresolvedAttempt }
				}

				const message =
					caught instanceof Error
						? caught.message
						: "No se pudo enviar el permiso"
				const syncError =
					caught instanceof BackendRequestError &&
					caught.code === "SYNC_VERSION_CONFLICT"
						? { error: message, reason: "outdated" as const }
						: caught instanceof BackendRequestError && caught.code
							? {
									error: `${message} (${caught.code})`,
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

				await savePermits(userId, downloads, {
					confirmedReplacementId: download.permit.id,
				})
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
		retrySyncPermit,
		discardAndDownload,
		syncingPermit: syncOperation !== null,
		syncOperation,
		error,
		clearError,
	}
}

function isUncertainRequestFailure(error: unknown): boolean {
	return (
		error instanceof BackendRequestError &&
		[
			"timeout",
			"unreachable",
			"invalid_response",
			"server_error",
			"unexpected",
		].includes(error.failure)
	)
}

function isSafeToClearSyncAttemptAfterRetry(error: unknown): boolean {
	if (
		!(error instanceof BackendRequestError) ||
		error.failure !== "rejected"
	) {
		return false
	}

	switch (error.code) {
		case "PERMIT_NOT_FOUND":
		case "PERMIT_SYNC_FORBIDDEN":
		case "PERMIT_SYNC_UNAVAILABLE":
		case "SYNC_VERSION_CONFLICT":
		case "VPRM_2":
		case "VPRT_1":
		case "VPRT_2":
		case "VPRT_3":
		case "VSHE_1":
		case "VSHE_2":
		case "VSHE_3":
		case "VSHE_4":
		case "VSHE_5":
		case "VSHE_6":
		case "VSHE_7":
		case "VCLG_1":
		case "VCLG_2":
		case "VCLG_3":
		case "VCLG_4":
		case "VCLG_5":
		case "VCLG_6":
		case "VCLG_7":
		case "VCLG_8":
		case "VCLG_9":
		case "VCLG_11":
		case "VCLG_12":
		case "VCLG_13":
		case "VCLG_14":
		case "VCLG_15":
		case "VCLG_16":
		case "VCLG_17":
		case "VCLG_18":
		case "VCLG_19":
			return true
		default:
			return false
	}
}
