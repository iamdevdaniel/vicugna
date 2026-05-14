export const ROUTES = {
	HOME: "/",
	FORM11: {
		LIST: "/form11",
		OVERVIEW: (id: string) => ({
			pathname: "/form11/[id]" as const,
			params: { id },
		}),
		SHEARING: (id: string) => ({
			pathname: "/form11/[id]/shearing" as const,
			params: { id },
		}),
		DEHEARING: (id: string) => ({
			pathname: "/form11/[id]/dehearing" as const,
			params: { id },
		}),
		RECORDS: {
			LIST: (id: string) => ({
				pathname: "/form11/[id]/records" as const,
				params: { id },
			}),
			EDIT: (id: string, recordId?: string) => ({
				pathname: "/form11/[id]/records/edit" as const,
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
