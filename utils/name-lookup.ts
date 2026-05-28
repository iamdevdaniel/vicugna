import regionals from "@assets/data/regionals.json"
import type { BasicInfo } from "@definitions/types"

export const getRegionalName = (form: BasicInfo): string => {
	const departament = regionals[form.departament as keyof typeof regionals]
	if (!departament) return "NA"
	return (
		departament.regionals.find((r) => r.id === form.regional)?.name || "NA"
	)
}

export const getCommunityName = (form: BasicInfo): string => {
	const departament = regionals[form.departament as keyof typeof regionals]
	if (!departament) return "NA"
	const regional = departament.regionals.find((r) =>
		r.communities.some((c) => c.id === form.community),
	)
	if (!regional) return "NA"
	const comunidad = regional.communities.find((c) => c.id === form.community)
	return comunidad?.name || "NA"
}
