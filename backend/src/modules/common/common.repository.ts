import { db } from "@db"

export interface CommonSelectOption {
	id: string
	name: string
}

export async function listSeasons(): Promise<CommonSelectOption[]> {
	const rows = await db.query.seasons.findMany({
		orderBy: (table, { desc, asc: sortAsc }) => [
			desc(table.isActive),
			sortAsc(table.startDate),
			sortAsc(table.name),
		],
	})

	return rows.map((season) => ({
		id: season.id,
		name: season.name,
	}))
}
