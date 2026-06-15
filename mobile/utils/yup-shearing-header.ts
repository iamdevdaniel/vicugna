import type { ShearingHeaderFormData } from "@definitions/types"
import * as yup from "yup"

export const defaultValuesShearingHeader: ShearingHeaderFormData = {
	site: "",
	latitude: 0,
	longitude: 0,
	roundupCount: 0,
	startTime: "",
	endTime: "",
}

export const yupShearingHeader = yup.object().shape({
	site: yup.string().required("Campo requerido"),
	latitude: yup
		.number()
		.typeError("Debe ser un número")
		.required("Campo requerido"),
	longitude: yup
		.number()
		.typeError("Debe ser un número")
		.required("Campo requerido"),
	roundupCount: yup
		.number()
		.typeError("Debe ser un número")
		.min(0, "No puede ser negativo")
		.required("Campo requerido"),
	startTime: yup.string().required("Campo requerido"),
	endTime: yup.string().required("Campo requerido"),
})
