import * as yup from "yup"

export const schemaBasicInfo = yup.object().shape({
	department: yup.string().required("Requerido"),
	regional: yup.string().required("Requerido"),
	community: yup.string().required("Requerido"),
	site: yup.string().required("Requerido"),
	date: yup.string().required("Requerido"),
})

export const defaultValuesBasicInfo = {
	department: "",
	regional: "",
	community: "",
	site: "",
	date: "",
}
