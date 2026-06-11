import regionals from "@assets/data/regionals.json"
import type { StepState } from "@components"
import type { BasicInfo } from "@definitions/types"

type DropdownOption = {
	label: string
	value: string
}

const getDepartment = (departmentKey: string) =>
	regionals[departmentKey as keyof typeof regionals]

export const getDepartmentOptions = (): DropdownOption[] =>
	Object.keys(regionals).map((key) => ({
		label: key,
		value: key,
	}))

export const getRegionalOptions = (departmentKey: string): DropdownOption[] => {
	const department = getDepartment(departmentKey)
	if (!department) return []

	return department.regionals.map((regional) => ({
		label: regional.name,
		value: regional.id,
	}))
}

export const getCommunityOptions = (
	departmentKey: string,
	regionalId: string,
): DropdownOption[] => {
	const department = getDepartment(departmentKey)
	if (!department) return []

	const regional = department.regionals.find((item) => item.id === regionalId)
	if (!regional) return []

	return regional.communities.map((community) => ({
		label: community.name,
		value: community.id,
	}))
}

export const getRegionalName = (form: BasicInfo): string => {
	const department = getDepartment(form.department)
	if (!department) return "NA"
	return (
		department.regionals.find((r) => r.id === form.regional)?.name || "NA"
	)
}

export const getCommunityName = (form: BasicInfo): string => {
	const department = getDepartment(form.department)
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
