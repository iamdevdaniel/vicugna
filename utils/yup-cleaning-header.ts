import type { CleaningHeaderFormData } from "@definitions/types"
import * as yup from "yup"

export const defaultValuesCleaningHeader: CleaningHeaderFormData = {
	startDate: "",
	endDate: "",
	site: "",
	supervisors: "",
}

export const yupCleaningHeader = yup.object().shape({
	startDate: yup.string().required("Campo requerido"),
	endDate: yup.string().required("Campo requerido"),
	site: yup.string().required("Campo requerido"),
	supervisors: yup.string().required("Campo requerido"),
})
