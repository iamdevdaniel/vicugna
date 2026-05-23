import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const appDbSchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "basicInfo",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "departamento", type: "string" },
				{ name: "asociacionRegional", type: "string" },
				{ name: "comunidadManejadora", type: "string" },
				{ name: "sitioCaptura", type: "string" },
				{ name: "fechaCaptura", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "form11Shearing",
			columns: [
				{ name: "departamento", type: "string" },
				{ name: "asociacionRegional", type: "string" },
				{ name: "comunidadManejadora", type: "string" },
				{ name: "sitioCaptura", type: "string" },
				{ name: "fechaCaptura", type: "string" },
				{ name: "codigoAutorizacion", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "form11Dehearing",
			columns: [
				{ name: "fechaInicioPredescerdado", type: "string" },
				{ name: "fechaFinPredescerdado", type: "string" },
				{ name: "lugarPredescerdado", type: "string" },
				{ name: "responsablesPredescerdado", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "form11Record",
			columns: [
				{ name: "form11StorageId", type: "string" },
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
			name: "form11Storage",
			columns: [
				{ name: "shearingId", type: "string" },
				{ name: "dehearingId", type: "string" },
			],
		}),
		tableSchema({
			name: "participants",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "nombre", type: "string" },
				{ name: "apellidos", type: "string" },
				{ name: "genero", type: "string" },
				{ name: "cedulaIdentidad", type: "string" },
				{ name: "firma", type: "string" },
				{ name: "notas", type: "string" },
			],
		}),
	],
})
