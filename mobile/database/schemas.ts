import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const appDbSchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "permits",
			columns: [
				{ name: "seasonId", type: "string", isIndexed: true },
				{ name: "seasonName", type: "string" },
				{ name: "communityId", type: "string", isIndexed: true },
				{ name: "regionalId", type: "string", isIndexed: true },
				{ name: "departmentId", type: "string", isIndexed: true },
				{ name: "permitNumber", type: "string", isIndexed: true },
				{ name: "userId", type: "string", isIndexed: true },
				{ name: "userFullName", type: "string" },
				{ name: "isActiveAssignmentUser", type: "boolean" },
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
			name: "cleaningHeader",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "startDate", type: "string" },
				{ name: "endDate", type: "string" },
				{ name: "site", type: "string" },
				{ name: "supervisors", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "cleaningCommon",
			columns: [
				{ name: "permitId", type: "string", isIndexed: true },
				{ name: "fleeceNumber", type: "string" },
				{ name: "grossWeight", type: "number" },
			],
		}),
		tableSchema({
			name: "grooming",
			columns: [
				{ name: "cleaningCommonId", type: "string", isIndexed: true },
				{ name: "cleanWeight", type: "number" },
				{ name: "dirtyWeight", type: "number" },
				{ name: "totalWeight", type: "number" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
		tableSchema({
			name: "dehearing",
			columns: [
				{ name: "cleaningCommonId", type: "string", isIndexed: true },
				{ name: "dehairedWeight", type: "number" },
				{ name: "bristleWeight", type: "number" },
				{ name: "hasDandruff", type: "boolean" },
				{ name: "dehairerName", type: "string" },
				{ name: "signature", type: "string" },
				{ name: "isCompleted", type: "boolean" },
			],
		}),
	],
})
