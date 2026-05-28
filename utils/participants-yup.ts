import type { ParticipantFormData } from "@definitions/types"
import * as yup from "yup"

export const schemaParticipant = yup.object().shape({
	name: yup.string().required("Requerido"),
	lastNames: yup.string().required("Requerido"),
	gender: yup
		.mixed<"M" | "F">()
		.oneOf(["M", "F"], "Seleccionar M o F")
		.defined()
		.required("Requerido"),
	identityNumber: yup.string().required("Requerido"),
	signature: yup.string().required("Requerido"),
	notes: yup.string().defined(),
})

export const defaultValuesParticipant: ParticipantFormData = {
	name: "",
	lastNames: "",
	gender: "M",
	identityNumber: "",
	signature: "",
	notes: "",
}
