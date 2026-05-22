import * as yup from "yup"

export const schemaBasicInfo = yup.object().shape({
	departamento: yup.string().required("Requerido"),
	asociacionRegional: yup.string().required("Requerido"),
	comunidadManejadora: yup.string().required("Requerido"),
	sitioCaptura: yup.string().required("Requerido"),
	fechaCaptura: yup.string().required("Requerido"),
})

export const defaultValuesBasicInfo = {
	departamento: "",
	asociacionRegional: "",
	comunidadManejadora: "",
	sitioCaptura: "",
	fechaCaptura: "",
}
