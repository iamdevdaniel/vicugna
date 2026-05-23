import type { ParticipantFormData } from "@definitions/types"
import * as yup from "yup"

export const schemaParticipant = yup.object().shape({
	nombre: yup.string().required("Requerido"),
	apellidos: yup.string().required("Requerido"),
	genero: yup
		.string()
		.test("genero", "Seleccionar M o F", (v) => v === "M" || v === "F")
		.required("Requerido"),
	cedulaIdentidad: yup.string().required("Requerido"),
	firma: yup.string().required("Requerido"),
	notas: yup.string().defined(),
})

export const defaultValuesParticipant: ParticipantFormData = {
	nombre: "",
	apellidos: "",
	genero: "",
	cedulaIdentidad: "",
	firma: "",
	notas: "",
}
