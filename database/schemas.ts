import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const appDbSchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "form11_shearing",
			columns: [
				{ name: "departamento", type: "string" },
				{ name: "asociacionRegional", type: "string" },
				{ name: "comunidadManejadora", type: "string" },
				{ name: "sitioCaptura", type: "string" },
				{ name: "fechaCaptura", type: "string" },
				{ name: "codigoAutorizacion", type: "string" },
			],
		}),
		tableSchema({
			name: "form11_dehearing",
			columns: [
				{ name: "fechaInicioPredescerdado", type: "string" },
				{ name: "fechaFinPredescerdado", type: "string" },
				{ name: "lugarPredescerdado", type: "string" },
				{ name: "responsablesPredescerdado", type: "string" },
			],
		}),
		tableSchema({
			name: "form11_record",
			columns: [
				{ name: "storageId", type: "string" },
				{ name: "ficha", type: "string" },
				{ name: "pesoFibraBruto", type: "string" },
				{ name: "pesoVellonLimpio", type: "string" },
				{ name: "pesoBraga", type: "string" },
				{ name: "pesoTotalFibra", type: "string" },
				{ name: "pesoFibraPredescerdada", type: "string" },
				{ name: "pesoCerda", type: "string" },
				{ name: "caspa", type: "string" },
				{ name: "nombrePredescerdador", type: "string" },
			],
		}),
		tableSchema({
			name: "sync_meta",
			columns: [
				{ name: "stage", type: "string" },
				{ name: "timestamp", type: "number" },
				{ name: "errorMessage", type: "string", isOptional: true },
			],
		}),
		tableSchema({
			name: "form11_storage",
			columns: [
				{ name: "sync", type: "string" },
				{ name: "shearingId", type: "string" },
				{ name: "dehearingId", type: "string" },
			],
		}),
	],
})
