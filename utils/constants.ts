export const ROUTES = {
	HOME: "/",
	FORM11: {
		LIST: "/form11",
		OVERVIEW: "/form11/[id]",
		SHEARING: "/form11/[id]/shearing",
		DEHEARING: "/form11/[id]/dehearing",
		RECORDS: {
			LIST: "/form11/[id]/records",
			OVERVIEW: "/form11/[id]/records/[id]",
			EDIT: "/form11/[id]/records/[id]/edit",
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
