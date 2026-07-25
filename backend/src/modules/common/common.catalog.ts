import { readFile } from "node:fs/promises"
import path from "node:path"

type CommunityCatalogEntry = {
	id: string
	name: string
	regionalName: string
}

type RegionalsCatalog = Record<
	string,
	{
		id: string
		name: string
		regionals: Array<{
			id: string
			name: string
			communities: Array<{
				id: string
				name: string
			}>
		}>
	}
>

let cachedCommunitiesById: Map<string, CommunityCatalogEntry> | null = null

export async function readRegionalsCatalog(): Promise<RegionalsCatalog> {
	const filePath = path.resolve(process.cwd(), "src/assets/regionals.json")
	const file = await readFile(filePath, "utf8")

	return JSON.parse(file) as RegionalsCatalog
}

export async function getCommunityNameById(communityId: string) {
	return (await getCommunitiesById()).get(communityId)?.name ?? ""
}

export async function getRegionalNameByCommunityId(communityId: string) {
	return (await getCommunitiesById()).get(communityId)?.regionalName ?? ""
}

async function getCommunitiesById() {
	if (cachedCommunitiesById) {
		return cachedCommunitiesById
	}

	const catalog = await readRegionalsCatalog()
	const communitiesById = new Map<string, CommunityCatalogEntry>()

	for (const department of Object.values(catalog)) {
		for (const regional of department.regionals) {
			for (const community of regional.communities) {
				communitiesById.set(community.id, {
					id: community.id,
					name: community.name,
					regionalName: regional.name,
				})
			}
		}
	}

	cachedCommunitiesById = communitiesById

	return communitiesById
}
