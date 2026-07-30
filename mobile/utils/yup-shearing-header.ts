import type { ShearingHeaderFormData } from "@definitions/types"
import * as yup from "yup"

export const defaultValuesShearingHeader: ShearingHeaderFormData = {
	site: "",
	latitude: "",
	longitude: "",
	roundupCount: "",
	eventDate: "",
	startTime: "",
	endTime: "",
}

function yupRequiredNumericText() {
	return yup
		.string()
		.required("Campo requerido")
		.test("is-number", "Debe ser un número", (value) => {
			if (!value) {
				return false
			}

			return !Number.isNaN(Number(value))
		})
}

export const yupShearingHeader = yup.object().shape({
	site: yup.string().required("Campo requerido"),
	latitude: yupRequiredNumericText(),
	longitude: yupRequiredNumericText(),
	roundupCount: yupRequiredNumericText().test(
		"is-non-negative",
		"No puede ser negativo",
		(value) => {
			if (!value) {
				return false
			}

			return Number(value) >= 0
		},
	),
	eventDate: yup.string().required("Campo requerido"),
	startTime: yup.string().required("Campo requerido"),
	endTime: yup.string().required("Campo requerido"),
})
