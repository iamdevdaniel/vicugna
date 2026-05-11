export const ROUTES = {
	HOME: "/",
	FORM11: {
		LIST: "/form11",
		NEW: "/form11/new",
		OVERVIEW: "/form11/[id]",
		SHEARING: {
			NEW: "/form11/[id]/shearing/new",
			OVERVIEW: "/form11/[id]/shearing",
			UPDATE: "/form11/[id]/shearing/edit",
		},
		DEHEARING: {
			NEW: "/form11/[id]/dehearing/new",
			OVERVIEW: "/form11/[id]/dehearing",
			UPDATE: "/form11/[id]/dehearing/edit",
		},
		RECORDS: {
			NEW: "/form11/[id]/records/new",
			LIST: "/form11/[id]/records",
			OVERVIEW: "/form11/[id]/records/[id]",
			UPDATE: "/form11/[id]/records/[id]/edit",
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
