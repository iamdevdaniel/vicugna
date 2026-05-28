import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const appDbSchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "basicInfo",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "departament", type: "string" },
				{ name: "regional", type: "string" },
				{ name: "community", type: "string" },
				{ name: "site", type: "string" },
				{ name: "date", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "participants",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "name", type: "string" },
				{ name: "lastNames", type: "string" },
				{ name: "gender", type: "string" },
				{ name: "identityNumber", type: "string" },
				{ name: "signature", type: "string" },
				{ name: "notes", type: "string" },
			],
		}),

		tableSchema({
			name: "form11Shearing",
			columns: [
				{ name: "departament", type: "string" },
				{ name: "regional", type: "string" },
				{ name: "community", type: "string" },
				{ name: "site", type: "string" },
				{ name: "date", type: "string" },
				{ name: "codigoAutorizacion", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "form11Dehearing",
			columns: [
				{ name: "startDate", type: "string" },
				{ name: "endDate", type: "string" },
				{ name: "site", type: "string" },
				{ name: "supervisors", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "form11Record",
			columns: [
				{ name: "form11StorageId", type: "string" },
				{ name: "tagId", type: "string" },
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
	],
})
