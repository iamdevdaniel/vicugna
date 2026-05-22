import * as yup from "yup"

export const schemaBasicInfo = yup.object().shape({
	asociacionRegional: yup.string().required("Requerido"),
	comunidadManejadora: yup.string().required("Requerido"),
	sitioCaptura: yup.string().required("Requerido"),
	fechaCaptura: yup.string().required("Requerido"),
})

export const defaultValuesBasicInfo = {
	asociacionRegional: "",
	comunidadManejadora: "",
	sitioCaptura: "",
	fechaCaptura: "",
}
