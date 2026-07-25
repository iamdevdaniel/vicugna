import { pool } from "@config"
import { db } from "@db"
import { readRegionalsCatalog } from "../../modules/common/common.catalog"
import { communities, departments, regionals } from "../schema"

async function seedRegionalsCatalog() {
	const catalog = await readRegionalsCatalog()

	for (const department of Object.values(catalog)) {
		await db
			.insert(departments)
			.values({
				id: department.id,
				name: department.name,
			})
			.onConflictDoUpdate({
				target: departments.id,
				set: {
					name: department.name,
				},
			})

		for (const regional of department.regionals) {
			await db
				.insert(regionals)
				.values({
					id: regional.id,
					departmentId: department.id,
					name: regional.name,
				})
				.onConflictDoUpdate({
					target: regionals.id,
					set: {
						departmentId: department.id,
						name: regional.name,
					},
				})

			for (const community of regional.communities) {
				await db
					.insert(communities)
					.values({
						id: community.id,
						regionalId: regional.id,
						name: community.name,
					})
					.onConflictDoUpdate({
						target: communities.id,
						set: {
							regionalId: regional.id,
							name: community.name,
						},
					})
			}
		}
	}
}

seedRegionalsCatalog()
	.then(async () => {
		await pool.end()
		console.log("🌿 Regionals catalog seeded")
	})
	.catch(async (error: unknown) => {
		await pool.end()
		console.error(error)
		process.exit(1)
	})
