import {
	BackendRequestError,
	fetchPermits,
	isDeviceOffline,
	submitSyncFieldData,
} from "@api"
import {
	clearPermitSyncPending,
	confirmPermitSync,
	getPendingPermitSyncData,
	preparePermitSync,
	savePermits,
} from "@database"
import {
	backendPermitSyncCodes,
	type MobileErrorDefinition,
	MobileOperationError,
	mobilePermitSyncErrors,
	mobileRequestErrors,
} from "@definitions/errors"
import { useMobileAuthStore } from "@utils/auth-store"
import {
	finishDataOperation,
	tryStartDataOperation,
} from "@utils/data-operation-guard"
import { useCallback, useState } from "react"
import { useShallow } from "zustand/react/shallow"

type PermitLoadResult = { ok: true } | { ok: false; error: string }
type SyncPermitResult =
	| { ok: true; warning?: string }
	| { ok: false; error: string; reason?: "outdated" | "pending" }

export function useLoadPermits() {
	const [loadingPermits, setLoadingPermits] = useState(false)
	const { token, userId } = useMobileAuthStore(
		useShallow((state) => ({
			token: state.token,
			userId: state.user?.id ?? null,
		})),
	)

	const loadPermits = useCallback(async (): Promise<PermitLoadResult> => {
		if (!token || !userId) {
			return { ok: false, error: "Sesión no disponible" }
		}
		if (!tryStartDataOperation("overview-only")) {
			return { ok: false, error: "Ya hay una operación en curso" }
		}

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
			finishDataOperation()
			setLoadingPermits(false)
		}
	}, [token, userId])

	return { loadPermits, loadingPermits }
}

export function useSyncPermit() {
	const [syncOperation, setSyncOperation] = useState<
		"upload" | "download" | null
	>(null)
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
				return { ok: false, error: message }
			}
			if (!tryStartDataOperation("overview-only")) {
				return { ok: false, error: "Ya hay una operación en curso" }
			}

			setSyncOperation("upload")

			try {
				if (await isDeviceOffline()) {
					return {
						ok: false,
						error: mobileRequestErrors.offline.message,
					}
				}

				const payload = await preparePermitSync(permitId, userId)
				const result = await submitSyncFieldData(token, payload)
				await confirmPermitSync(result, userId)

				return { ok: true }
			} catch (caught) {
				switch (getErrorCode(caught)) {
					case mobilePermitSyncErrors.prepareSync.code:
						return {
							ok: false,
							error: getErrorMessage(
								caught,
								mobilePermitSyncErrors.prepareSync,
							),
						}
					case mobilePermitSyncErrors.confirmUpload.code:
						return {
							ok: false,
							error: getErrorMessage(
								caught,
								mobilePermitSyncErrors.confirmUpload,
							),
							reason: "pending",
						}
				}

				if (isUncertainRequestFailure(caught)) {
					return {
						ok: false,
						error: getPendingSyncError(caught),
						reason: "pending",
					}
				}

				const clearFailure = await clearSyncPendingAfterFailure(
					permitId,
					userId,
				)
				if (clearFailure) return clearFailure

				return getRejectedSyncResult(caught)
			} finally {
				finishDataOperation()
				setSyncOperation(null)
			}
		},
		[token, userId],
	)

	const retrySyncPermit = useCallback(
		async (permitId: string): Promise<SyncPermitResult> => {
			if (!token || !userId) {
				const message = "Debes iniciar sesión para enviar este permiso"
				return { ok: false, error: message }
			}
			if (!tryStartDataOperation("overview-only")) {
				return { ok: false, error: "Ya hay una operación en curso" }
			}

			setSyncOperation("upload")

			try {
				try {
					const payload = await getPendingPermitSyncData(
						permitId,
						userId,
					)
					const result = await submitSyncFieldData(token, payload)
					await confirmPermitSync(result, userId)
				} catch (caught) {
					switch (getErrorCode(caught)) {
						case mobilePermitSyncErrors.readData.code:
							return {
								ok: false,
								error: getErrorMessage(
									caught,
									mobilePermitSyncErrors.readData,
								),
								reason: "pending",
							}
						case mobilePermitSyncErrors.confirmUpload.code:
							return {
								ok: false,
								error: getErrorMessage(
									caught,
									mobilePermitSyncErrors.confirmUpload,
								),
								reason: "pending",
							}
					}

					if (!isSafeToClearSyncPendingAfterRetry(caught)) {
						const retryNeedsLogin =
							caught instanceof BackendRequestError &&
							caught.status === 401
						return {
							ok: false,
							error: retryNeedsLogin
								? "Tu sesión terminó. Inicia sesión y vuelve a intentar el envío."
								: getPendingSyncError(caught),
							reason: "pending",
						}
					}

					const clearFailure = await clearSyncPendingAfterFailure(
						permitId,
						userId,
					)
					if (clearFailure) return clearFailure

					return getRejectedSyncResult(caught)
				}
				return { ok: true }
			} finally {
				finishDataOperation()
				setSyncOperation(null)
			}
		},
		[token, userId],
	)

	const discardAndDownload = useCallback(
		async (permitId: string): Promise<PermitLoadResult> => {
			if (!token || !userId) {
				return { ok: false, error: "Sesión no disponible" }
			}
			if (!tryStartDataOperation("overview-only")) {
				return { ok: false, error: "Ya hay una operación en curso" }
			}

			setSyncOperation("download")
			try {
				const downloads = await fetchPermits(token)
				const download = downloads.find(
					({ permit }) => permit.id === permitId,
				)
				if (!download) {
					throw new Error("El permiso ya no está disponible")
				}

				await savePermits(userId, [download])
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
				finishDataOperation()
				setSyncOperation(null)
			}
		},
		[token, userId],
	)

	return {
		syncPermit,
		retrySyncPermit,
		discardAndDownload,
		syncingPermit: syncOperation !== null,
		syncOperation,
	}
}

function isUncertainRequestFailure(error: unknown): boolean {
	if (!(error instanceof BackendRequestError)) return false

	switch (error.code) {
		case mobileRequestErrors.timeout.code:
		case mobileRequestErrors.unreachable.code:
		case mobileRequestErrors.invalidResponse.code:
		case mobileRequestErrors.serverError.code:
		case mobileRequestErrors.unexpected.code:
			return true
		default:
			return false
	}
}

function isSafeToClearSyncPendingAfterRetry(error: unknown): boolean {
	if (!(error instanceof BackendRequestError)) return false

	switch (error.code) {
		case backendPermitSyncCodes.permitNotFound:
		case backendPermitSyncCodes.permitForbidden:
		case backendPermitSyncCodes.permitUnavailable:
		case backendPermitSyncCodes.dataConflict:
		case backendPermitSyncCodes.unsupportedHashVersion:
		case backendPermitSyncCodes.participantsMissing:
		case backendPermitSyncCodes.participantPermit:
		case backendPermitSyncCodes.participantDuplicate:
		case backendPermitSyncCodes.shearingIncomplete:
		case backendPermitSyncCodes.shearingHeaderPermit:
		case backendPermitSyncCodes.shearingRecordsMissing:
		case backendPermitSyncCodes.shearingRecordPermit:
		case backendPermitSyncCodes.gestation:
		case backendPermitSyncCodes.sheared:
		case backendPermitSyncCodes.shearingRecordDuplicate:
		case backendPermitSyncCodes.cleaningHeaderIncomplete:
		case backendPermitSyncCodes.cleaningHeaderPermit:
		case backendPermitSyncCodes.cleaningRecordsMissing:
		case backendPermitSyncCodes.cleaningDetailCount:
		case backendPermitSyncCodes.cleaningRecordPermit:
		case backendPermitSyncCodes.cleaningDetailIncomplete:
		case backendPermitSyncCodes.groomingPermit:
		case backendPermitSyncCodes.dehearingPermit:
		case backendPermitSyncCodes.bothDetails:
		case backendPermitSyncCodes.cleanWeight:
		case backendPermitSyncCodes.dirtyWeight:
		case backendPermitSyncCodes.totalWeight:
		case backendPermitSyncCodes.calculatedWeight:
		case backendPermitSyncCodes.cleaningRecordDuplicate:
		case backendPermitSyncCodes.groomingRelationDuplicate:
		case backendPermitSyncCodes.groomingDetailDuplicate:
		case backendPermitSyncCodes.dehearingRelationDuplicate:
		case backendPermitSyncCodes.dehearingDetailDuplicate:
			return true
		default:
			return false
	}
}

async function clearSyncPendingAfterFailure(
	permitId: string,
	userId: string,
): Promise<SyncPermitResult | null> {
	try {
		await clearPermitSyncPending(permitId, userId)
		return null
	} catch (caught) {
		return {
			ok: false,
			error: getErrorMessage(caught, mobilePermitSyncErrors.clearPending),
			reason: "pending",
		}
	}
}

function getRejectedSyncResult(error: unknown): SyncPermitResult {
	const message =
		error instanceof Error ? error.message : "No se pudo enviar el permiso"

	if (
		error instanceof BackendRequestError &&
		error.code === backendPermitSyncCodes.dataConflict
	) {
		return { ok: false, error: message, reason: "outdated" }
	}

	if (error instanceof BackendRequestError) {
		return { ok: false, error: message }
	}

	return { ok: false, error: message }
}

function getErrorCode(error: unknown): string | null {
	if (
		error instanceof MobileOperationError ||
		error instanceof BackendRequestError
	) {
		return error.code
	}

	return null
}

function getErrorMessage(
	error: unknown,
	fallback: MobileErrorDefinition,
): string {
	if (
		error instanceof MobileOperationError ||
		error instanceof BackendRequestError
	) {
		return error.message
	}

	return getMobileSyncError(fallback)
}

function getMobileSyncError(error: MobileErrorDefinition): string {
	return error.message
}

function getPendingSyncError(error: unknown): string {
	if (error instanceof BackendRequestError) {
		switch (error.code) {
			case mobileRequestErrors.offline.code:
			case mobileRequestErrors.unreachable.code:
				return "No hay conexión. Tus datos están guardados. Conéctate a internet y pulsa Reintentar envío."
			case mobileRequestErrors.timeout.code:
				return "No llegó la confirmación del envío. Tus datos están guardados. Pulsa Reintentar envío."
			case mobileRequestErrors.serverError.code:
				return "El servidor tuvo un problema. Tus datos están guardados. Pulsa Reintentar envío."
		}
	}

	return mobilePermitSyncErrors.resultUnknown.message
}
