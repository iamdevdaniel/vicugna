import type { CleaningHeaderFormData } from "@definitions/types"
import * as yup from "yup"

export const defaultValuesCleaningHeader: CleaningHeaderFormData = {
	startDate: "",
	endDate: "",
	site: "",
	supervisors: "",
}

export const yupCleaningHeader = yup.object().shape({
	startDate: yup.string().trim().required("Campo requerido"),
	endDate: yup.string().defined(),
	site: yup.string().trim().required("Campo requerido"),
	supervisors: yup.string().trim().required("Campo requerido"),
})
