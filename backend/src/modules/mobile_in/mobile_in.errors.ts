export type PermitValidationIssue = {
	path: string
	code: string
	message: string
}

export type PermitValidationCode =
	| "PRSG"
	| `VPRM_${number}`
	| `VPRT_${number}`
	| `VSHE_${number}`
	| `VCLG_${number}`

type PermitValidationDefinition = {
	code: PermitValidationCode
	message: string
}

export const permitValidationErrors = {
	parse: { code: "PRSG", message: "El contenido del permiso no es válido" },
	permitId: {
		code: "VPRM_1",
		message: "El identificador del permiso es obligatorio",
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
	shearingHeaderMissing: {
		code: "VSHE_1",
		message: "La cabecera de esquila es obligatoria",
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
	cleaningHeaderMissing: {
		code: "VCLG_1",
		message: "La información general del registro de fibra es obligatoria",
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
	grossWeight: { code: "VCLG_6", message: "El peso bruto no es válido" },
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
	groomingWeights: {
		code: "VCLG_10",
		message: "Los pesos del limpiado no son válidos",
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

export class PermitValidationError extends Error {
	constructor(
		readonly definition: PermitValidationDefinition,
		readonly issues: PermitValidationIssue[] = [],
	) {
		super(definition.message)
		this.name = "PermitValidationError"
	}

	get code() {
		return this.definition.code
	}
}

export class PermitNotFoundError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitNotFoundError"
	}
}

export class PermitSyncForbiddenError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitSyncForbiddenError"
	}
}

export class PermitSyncConflictError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "PermitSyncConflictError"
	}
}
