import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const appDbSchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "basicInfo",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "department", type: "string" },
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
			name: "shearingHeader",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "site", type: "string" },
				{ name: "latitude", type: "number" },
				{ name: "longitude", type: "number" },
				{ name: "roundupCount", type: "number" },
				{ name: "startTime", type: "string" },
				{ name: "endTime", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "shearingRecord",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "tagNumber", type: "number" },
				{ name: "sex", type: "string" },
				{ name: "ageCategory", type: "string" },
				{ name: "liveWeight", type: "number" },
				{ name: "fiberLength", type: "number" },
				{ name: "bodyCondition", type: "string" },
				{ name: "gestationStatus", type: "string" },
				{ name: "externalParasites", type: "string" },
				{ name: "mangeSeverity", type: "string" },
				{ name: "hasDandruff", type: "boolean" },
				{ name: "isSheared", type: "boolean" },
				{ name: "isDead", type: "boolean" },
				{ name: "observations", type: "string" },
			],
		}),
		tableSchema({
			name: "form11Shearing",
			columns: [
				{ name: "department", type: "string" },
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
