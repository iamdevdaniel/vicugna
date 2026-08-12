import type { ParticipantFormData } from "@definitions/types"
import * as yup from "yup"
import { yupRequiredPositiveIntegerText } from "./yup-utils"

export const yupParticipant = yup.object().shape({
	name: yup.string().required("Requerido"),
	lastNames: yup.string().required("Requerido"),
	gender: yup
		.mixed<"M" | "F">()
		.oneOf(["M", "F"], "Seleccionar M o F")
		.defined()
		.required("Requerido"),
	identityNumber: yupRequiredPositiveIntegerText(),
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
