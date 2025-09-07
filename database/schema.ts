import { appSchema, tableSchema } from "@nozbe/watermelondb"

export const mySchema = appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: "notes",
			columns: [
				{ name: "text", type: "string" },
				{ name: "created_at", type: "number" },
				{ name: "updated_at", type: "number" },
			],
		}),
	],
})
