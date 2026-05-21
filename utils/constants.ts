export const ROUTES = {
	HOME: "/",
	OVERVIEW: (id: string) => ({
		pathname: "/[id]" as const,
		params: { id },
	}),
	BASIC_INFO: (id: string) => ({
		pathname: "/[id]/basic-info" as const,
		params: { id },
	}),
	PARTICIPANTS: {
		LIST: (id: string) => ({
			pathname: "/[id]/participantes" as const,
			params: { id },
		}),
		OVERVIEW: (id: string, pid: string) => ({
			pathname: "/[id]/participantes/[pid]" as const,
			params: { id, pid },
		}),
	},
	SHEARING: {
		OVERVIEW: (id: string) => ({
			pathname: "/[id]/esquila" as const,
			params: { id },
		}),
		FORM12: (id: string) => ({
			pathname: "/[id]/esquila/form12" as const,
			params: { id },
		}),
		FORM10: (id: string) => ({
			pathname: "/[id]/esquila/form10" as const,
			params: { id },
		}),
	},
	CLEANUP: {
		LIST: (id: string) => ({
			pathname: "/[id]/limpieza" as const,
			params: { id },
		}),
		OVERVIEW: (id: string, recordId: string) => ({
			pathname: "/[id]/limpieza/[recordId]" as const,
			params: { id, recordId },
		}),
	},
	FORM11: {
		LIST: (permitId: string) => ({
			pathname: "/[id]/form11" as const,
			params: { id: permitId },
		}),
		OVERVIEW: (id: string) => ({
			pathname: "/[id]/form11/[id]" as const,
			params: { id },
		}),
		SHEARING: (id: string) => ({
			pathname: "/[id]/form11/[id]/shearing" as const,
			params: { id },
		}),
		DEHEARING: (id: string) => ({
			pathname: "/[id]/form11/[id]/dehearing" as const,
			params: { id },
		}),
		RECORDS: {
			LIST: (id: string) => ({
				pathname: "/[id]/form11/[id]/records" as const,
				params: { id },
			}),
			EDIT: (id: string, recordId?: string) => ({
				pathname: "/[id]/form11/[id]/records/edit" as const,
				params: { id, ...(recordId ? { recordId } : {}) },
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
