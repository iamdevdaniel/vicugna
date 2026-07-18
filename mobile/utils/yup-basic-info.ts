import * as yup from "yup"

export const yupBasicInfo = yup.object().shape({
	site: yup.string().required("Requerido"),
	date: yup.string().required("Requerido"),
})

export const defaultValuesBasicInfo = {
	site: "",
	date: "",
}
