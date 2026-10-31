import regionalsCatalog from "@shared/regionals.json"

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
	return regionalsCatalog
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
