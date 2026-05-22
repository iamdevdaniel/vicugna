import regionales from "@assets/data/regionales.json"
import type { BasicInfo } from "@definitions/types"

export const getRegionalName = (form: BasicInfo): string => {
	const departamento =
		regionales[form.departamento as keyof typeof regionales]
	if (!departamento) return "NA"
	return (
		departamento.regionales.find((r) => r.id === form.asociacionRegional)
			?.nombre || "NA"
	)
}

export const getCommunityName = (form: BasicInfo): string => {
	const departamento =
		regionales[form.departamento as keyof typeof regionales]
	if (!departamento) return "NA"
	const regional = departamento.regionales.find((r) =>
		r.comunidades.some((c) => c.id === form.comunidadManejadora),
	)
	if (!regional) return "NA"
	const comunidad = regional.comunidades.find(
		(c) => c.id === form.comunidadManejadora,
	)
	return comunidad?.nombre || "NA"
}
