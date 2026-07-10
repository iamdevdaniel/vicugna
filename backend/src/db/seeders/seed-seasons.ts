import { pool } from "@config"
import { db } from "@db"
import { seasons } from "../schema"

type SeasonSeed = {
	id: string
	name: string
	startDate: string
	endDate: string
	isActive: boolean
}

const SEASONS_TO_SEED: SeasonSeed[] = [
	{
		id: "season-2026",
		name: "Temporada 2026",
		startDate: "2026-06-01",
		endDate: "2027-08-31",
		isActive: true,
	},
	{
		id: "season-2025",
		name: "Temporada 2025",
		startDate: "2025-06-01",
		endDate: "2025-08-31",
		isActive: false,
	},
]

async function seedSeasons() {
	for (const season of SEASONS_TO_SEED) {
		await db
			.insert(seasons)
			.values(season)
			.onConflictDoUpdate({
				target: seasons.id,
				set: {
					name: season.name,
					startDate: season.startDate,
					endDate: season.endDate,
					isActive: season.isActive,
					updatedAt: new Date(),
				},
			})
	}
}

seedSeasons()
	.then(async () => {
		await pool.end()
		console.log("Seasons seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
