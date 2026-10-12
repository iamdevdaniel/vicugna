import type { ZodIssue } from "zod"

export type ServiceValidationRule =
	| "after"
	| "date_format"
	| "finite_number"
	| "maximum"
	| "maximum_items"
	| "non_blank"
	| "positive"
	| "positive_integer"
	| "range"
	| "time_format"
	| "unique_items"
	| "valid_date"
	| "valid_time"

export type ServiceValidationIssue = {
	path: string
	rule: ServiceValidationRule
	expected?: number | string | { min: number; max: number }
}

export type PermitValidationLogDetails =
	| { source: "zod"; issues: ZodIssue[] }
	| { source: "service"; issue: ServiceValidationIssue }

export type PermitValidationCode =
	| "PYLD"
	| `VPRM_${number}`
	| `VPRT_${number}`
	| `VSHE_${number}`
	| `VCLG_${number}`

type PermitValidationDefinition = {
	code: PermitValidationCode
	message: string
}

type PermitSyncErrorCode =
	| "PERMIT_NOT_FOUND"
	| "PERMIT_SYNC_FORBIDDEN"
	| "PERMIT_SYNC_UNAVAILABLE"
	| "SYNC_ATTEMPT_MISMATCH"
	| "SYNC_ATTEMPT_READ_FAILED"
	| "SYNC_VERSION_CONFLICT"

type PermitSyncErrorDefinition = {
	code: PermitSyncErrorCode
	message: string
	status: 403 | 404 | 409 | 500
}

export const permitValidationErrors = {
	invalidPayload: {
		code: "PYLD",
		message: "El contenido del permiso no es válido",
	},
	permitVersion: {
		code: "VPRM_2",
		message: "La versión del permiso no es válida",
	},
	participantsMissing: { code: "VPRT_1", message: "No hay participantes" },
	participantPermit: {
		code: "VPRT_2",
		message: "El participante no pertenece al permiso",
	},
	participantDuplicate: {
		code: "VPRT_3",
		message: "Hay un participante duplicado en los datos enviados",
	},
	shearingIncomplete: {
		code: "VSHE_1",
		message:
			"El registro de esquila debe estar completo antes de sincronizar",
	},
	shearingHeaderPermit: {
		code: "VSHE_2",
		message: "La cabecera de esquila no pertenece al permiso",
	},
	shearingRecordsMissing: {
		code: "VSHE_3",
		message: "No hay registros de esquila",
	},
	shearingRecordPermit: {
		code: "VSHE_4",
		message: "El registro de esquila no pertenece al permiso",
	},
	shearingRecordDuplicate: {
		code: "VSHE_7",
		message: "Hay un registro de esquila duplicado en los datos enviados",
	},
	gestation: {
		code: "VSHE_5",
		message: "Solo una hembra adulta puede estar en gestación",
	},
	sheared: {
		code: "VSHE_6",
		message: "El estado de esquila no coincide con la edad y la gestación",
	},
	cleaningHeaderIncomplete: {
		code: "VCLG_1",
		message:
			"La información general del registro de fibra debe estar completa antes de sincronizar",
	},
	cleaningHeaderPermit: {
		code: "VCLG_2",
		message:
			"La información general del registro de fibra no pertenece al permiso",
	},
	cleaningRecordsMissing: {
		code: "VCLG_3",
		message: "No hay registros de fibra",
	},
	cleaningDetailCount: {
		code: "VCLG_4",
		message: "Cada registro de fibra debe tener un detalle",
	},
	cleaningRecordPermit: {
		code: "VCLG_5",
		message: "El registro de fibra no pertenece al permiso",
	},
	cleaningDetailIncomplete: {
		code: "VCLG_6",
		message:
			"Todos los registros de fibra deben estar completos antes de sincronizar",
	},
	groomingPermit: {
		code: "VCLG_7",
		message: "El detalle de limpiado no pertenece al registro de fibra",
	},
	dehearingPermit: {
		code: "VCLG_8",
		message:
			"El detalle de predescerdado no pertenece al registro de fibra",
	},
	bothDetails: {
		code: "VCLG_9",
		message:
			"Un registro de fibra no puede tener limpiado y predescerdado a la vez",
	},
	cleanWeight: {
		code: "VCLG_11",
		message: "El peso del vellón limpio no puede superar el peso bruto",
	},
	dirtyWeight: {
		code: "VCLG_12",
		message: "El peso braga no puede superar el peso bruto",
	},
	totalWeight: {
		code: "VCLG_13",
		message:
			"La suma de los pesos del limpiado no puede superar el peso bruto",
	},
	calculatedWeight: {
		code: "VCLG_14",
		message:
			"El peso total de la fibra no coincide con los pesos del limpiado",
	},
	cleaningRecordDuplicate: {
		code: "VCLG_15",
		message: "Hay un registro de fibra duplicado en los datos enviados",
	},
	groomingRelationDuplicate: {
		code: "VCLG_16",
		message: "Hay una relación de limpiado duplicada en los datos enviados",
	},
	groomingDetailDuplicate: {
		code: "VCLG_17",
		message: "Hay un detalle de limpiado duplicado en los datos enviados",
	},
	dehearingRelationDuplicate: {
		code: "VCLG_18",
		message:
			"Hay una relación de predescerdado duplicada en los datos enviados",
	},
	dehearingDetailDuplicate: {
		code: "VCLG_19",
		message:
			"Hay un detalle de predescerdado duplicado en los datos enviados",
	},
} as const satisfies Record<string, PermitValidationDefinition>

export const permitSyncErrors = {
	notFound: {
		code: "PERMIT_NOT_FOUND",
		message: "El permiso no existe",
		status: 404,
	},
	forbidden: {
		code: "PERMIT_SYNC_FORBIDDEN",
		message: "No tienes autorización para enviar este permiso",
		status: 403,
	},
	versionConflict: {
		code: "SYNC_VERSION_CONFLICT",
		message: "Hay datos más nuevos de este permiso. ¿Qué quieres hacer?",
		status: 409,
	},
	unavailable: {
		code: "PERMIT_SYNC_UNAVAILABLE",
		message: "El permiso no está disponible para sincronizar",
		status: 409,
	},
	attemptMismatch: {
		code: "SYNC_ATTEMPT_MISMATCH",
		message:
			"No se pudo confirmar el envío. Sus datos siguen guardados. No los borre y pida ayuda.",
		status: 409,
	},
	attemptReadFailed: {
		code: "SYNC_ATTEMPT_READ_FAILED",
		message: "Error interno del servidor",
		status: 500,
	},
} as const satisfies Record<string, PermitSyncErrorDefinition>

export class PermitValidationError extends Error {
	constructor(
		readonly definition: PermitValidationDefinition,
		readonly logDetails?: PermitValidationLogDetails,
	) {
		super(definition.message)
		this.name = "PermitValidationError"
	}

	get code() {
		return this.definition.code
	}
}

export class PermitSyncError extends Error {
	constructor(readonly definition: PermitSyncErrorDefinition) {
		super(definition.message)
		this.name = "PermitSyncError"
	}

	get code() {
		return this.definition.code
	}

	get status() {
		return this.definition.status
	}
}
