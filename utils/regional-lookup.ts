import regionales from "@assets/data/regionales.json"
import type { Form11Shearing } from "@definitions/types"

export const getRegionalName = (form: Form11Shearing): string => {
	return (
		regionales[
			form.departamento as keyof typeof regionales
		].regionales.find((r) => r.id === form.asociacionRegional)?.nombre ||
		"NA"
	)
}

export const getCommunityName = (form: Form11Shearing): string => {
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
