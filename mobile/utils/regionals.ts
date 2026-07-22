import regionals from "@vicugna/shared/regionals.json"

const communityNameById = Object.values(regionals).reduce<
	Record<string, string>
>((lookup, department) => {
	for (const regional of department.regionals) {
		for (const community of regional.communities) {
			lookup[community.id] = community.name
		}
	}

	return lookup
}, {})

export function getCommunityName(communityId: string) {
	return communityNameById[communityId] ?? communityId
}
