import regionals from "@assets/data/regionals.json"
import type { StepState } from "@components"
import type { BasicInfo } from "@definitions/types"

export const getRegionalName = (form: BasicInfo): string => {
	const department = regionals[form.department as keyof typeof regionals]
	if (!department) return "NA"
	return (
		department.regionals.find((r) => r.id === form.regional)?.name || "NA"
	)
}

export const getCommunityName = (form: BasicInfo): string => {
	const department = regionals[form.department as keyof typeof regionals]
	if (!department) return "NA"
	const regional = department.regionals.find((r) =>
		r.communities.some((c) => c.id === form.community),
	)
	if (!regional) return "NA"
	const comunidad = regional.communities.find((c) => c.id === form.community)
	return comunidad?.name || "NA"
}

export const getDependentStepState = (
	isUnlocked: boolean,
	isDone: boolean,
): StepState => {
	if (!isUnlocked) return "disabled"
	if (isDone) return "done"
	return "ready"
}
