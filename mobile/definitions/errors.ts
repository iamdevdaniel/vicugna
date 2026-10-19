export type MobileErrorDefinition = {
	code: string
	message: string
}

export class MobileOperationError extends Error {
	readonly code: string

	constructor(definition: MobileErrorDefinition) {
		super(definition.message)
		this.name = "MobileOperationError"
		this.code = definition.code
	}
}

export const mobileRequestErrors = {
	offline: {
		code: "MOBILE_OFFLINE",
		message:
			"Sin conexión a internet. Intente nuevamente cuando recupere la conexión.",
	},
	timeout: {
		code: "MOBILE_REQUEST_TIMEOUT",
		message:
			"El servidor tardó demasiado en responder. Intente nuevamente.",
	},
	unreachable: {
		code: "MOBILE_SERVER_UNREACHABLE",
		message: "No se pudo conectar con el servidor. Intente más tarde.",
	},
	invalidResponse: {
		code: "MOBILE_INVALID_RESPONSE",
		message:
			"El servidor devolvió una respuesta inválida. Intente nuevamente.",
	},
	serverError: {
		code: "MOBILE_SERVER_ERROR",
		message: "El servidor no pudo completar la solicitud.",
	},
	rejected: {
		code: "MOBILE_REQUEST_REJECTED",
		message: "El servidor rechazó la solicitud.",
	},
	unexpected: {
		code: "MOBILE_REQUEST_FAILED",
		message: "Ocurrió un error al comunicarse con el servidor.",
	},
} as const satisfies Record<string, MobileErrorDefinition>

export const mobilePermitSyncErrors = {
	prepareSync: {
		code: "MOBILE_SYNC_PREPARE_FAILED",
		message: "No se pudo iniciar el envío. Intente nuevamente.",
	},
	readData: {
		code: "MOBILE_SYNC_DATA_READ_FAILED",
		message: "No se pudieron leer los datos guardados. Intente nuevamente.",
	},
	clearPending: {
		code: "MOBILE_SYNC_CLEAR_PENDING_FAILED",
		message:
			"El permiso sigue bloqueado. Sus datos están guardados. Pulse Reintentar envío.",
	},
	confirmUpload: {
		code: "MOBILE_SYNC_CONFIRMATION_FAILED",
		message:
			"El permiso se envió, pero el teléfono no guardó la confirmación. Pulse Reintentar envío.",
	},
	replaceWithServerCopy: {
		code: "MOBILE_SYNC_SERVER_REPLACE_FAILED",
		message:
			"No se pudieron guardar los datos del servidor. Sus datos siguen guardados en este dispositivo.",
	},
	unsupportedHashVersion: {
		code: "SYNC_HASH_VERSION_UNSUPPORTED",
		message:
			"Esta versión de la aplicación ya no puede recibir estos datos. Actualice la aplicación.",
	},
	resultUnknown: {
		code: "MOBILE_SYNC_RESULT_UNKNOWN",
		message:
			"No se pudo confirmar si el permiso se envió. Sus datos están guardados. Pulse Reintentar envío.",
	},
} as const satisfies Record<string, MobileErrorDefinition>

// These codes are duplicated from the backend until the error contract is stable.
export const backendPermitSyncCodes = {
	invalidPayload: "PYLD",
	participantsMissing: "VPRT_1",
	participantPermit: "VPRT_2",
	participantDuplicate: "VPRT_3",
	shearingIncomplete: "VSHE_1",
	shearingHeaderPermit: "VSHE_2",
	shearingRecordsMissing: "VSHE_3",
	shearingRecordPermit: "VSHE_4",
	gestation: "VSHE_5",
	sheared: "VSHE_6",
	shearingRecordDuplicate: "VSHE_7",
	cleaningHeaderIncomplete: "VCLG_1",
	cleaningHeaderPermit: "VCLG_2",
	cleaningRecordsMissing: "VCLG_3",
	cleaningDetailCount: "VCLG_4",
	cleaningRecordPermit: "VCLG_5",
	cleaningDetailIncomplete: "VCLG_6",
	groomingPermit: "VCLG_7",
	dehearingPermit: "VCLG_8",
	bothDetails: "VCLG_9",
	cleanWeight: "VCLG_11",
	dirtyWeight: "VCLG_12",
	totalWeight: "VCLG_13",
	calculatedWeight: "VCLG_14",
	cleaningRecordDuplicate: "VCLG_15",
	groomingRelationDuplicate: "VCLG_16",
	groomingDetailDuplicate: "VCLG_17",
	dehearingRelationDuplicate: "VCLG_18",
	dehearingDetailDuplicate: "VCLG_19",
	permitNotFound: "PERMIT_NOT_FOUND",
	permitForbidden: "PERMIT_SYNC_FORBIDDEN",
	permitUnavailable: "PERMIT_SYNC_UNAVAILABLE",
	dataConflict: "SYNC_DATA_CONFLICT",
	unsupportedHashVersion: mobilePermitSyncErrors.unsupportedHashVersion.code,
} as const
