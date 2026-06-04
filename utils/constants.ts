export const ROUTES = {
	HOME: "/",
	OVERVIEW: (permitId: string) => ({
		pathname: "/[permitId]" as const,
		params: { permitId },
	}),
	BASIC_INFO: (permitId: string) => ({
		pathname: "/[permitId]/basic-info" as const,
		params: { permitId },
	}),
	PARTICIPANTS: {
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/participants" as const,
			params: { permitId },
		}),
		FORM: (permitId: string, participantId: string) => ({
			pathname: "/[permitId]/participants/[participantId]" as const,
			params: { permitId, participantId },
		}),
	},
	SHEARING: {
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/shearing" as const,
			params: { permitId },
		}),
		HEADER: (permitId: string) => ({
			pathname: "/[permitId]/shearing/header" as const,
			params: { permitId },
		}),
		RECORD: (permitId: string, recordId?: string) => ({
			pathname: "/[permitId]/shearing/record" as const,
			params: { permitId, ...(recordId ? { recordId } : {}) },
		}),
	},
	CLEANUP: {
		LIST: (permitId: string) => ({
			pathname: "/[permitId]/cleanup" as const,
			params: { permitId },
		}),
		OVERVIEW: (permitId: string) => ({
			pathname: "/[permitId]/cleanup" as const,
			params: { permitId },
		}),
	},
	FORM11: {
		LIST: (permitId: string) => ({
			pathname: "/[permitId]/form11" as const,
			params: { permitId },
		}),
		OVERVIEW: (permitId: string, id: string) => ({
			pathname: "/[permitId]/form11/[id]" as const,
			params: { permitId, id },
		}),
		SHEARING: (permitId: string, id: string) => ({
			pathname: "/[permitId]/form11/[id]/shearing" as const,
			params: { permitId, id },
		}),
		DEHEARING: (permitId: string, id: string) => ({
			pathname: "/[permitId]/form11/[id]/dehearing" as const,
			params: { permitId, id },
		}),
		RECORDS: {
			LIST: (permitId: string, id: string) => ({
				pathname: "/[permitId]/form11/[id]/records" as const,
				params: { permitId, id },
			}),
			EDIT: (permitId: string, id: string, recordId?: string) => ({
				pathname: "/[permitId]/form11/[id]/records/edit" as const,
				params: { permitId, id, ...(recordId ? { recordId } : {}) },
			}),
		},
	},
}

export const DB_ERRORS = {
	FORM11: {
		FAILED_CREATE_STORAGE:
			"No se pudo crear el registro base para el Formulario 11.",
		FAILED_UPDATE_SHEARING: "Error al actualizar los datos de captura.",
		FAILED_UPDATE_DEHEARING:
			"Error al actualizar los datos de predescerdado.",
		NOT_FOUND: "El registro del Formulario 11 no existe.",
	},
} as const
