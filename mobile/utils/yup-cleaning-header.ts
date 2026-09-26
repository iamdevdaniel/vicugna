import type { CleaningHeaderFormData } from "@definitions/types"
import * as yup from "yup"
import { yupOptionalCalendarDate, yupRequiredCalendarDate } from "./yup-utils"

export const defaultValuesCleaningHeader: CleaningHeaderFormData = {
	startDate: "",
	endDate: "",
	site: "",
	supervisors: "",
}

export const yupCleaningHeader = yup.object().shape({
	startDate: yupRequiredCalendarDate(),
	endDate: yupOptionalCalendarDate(),
	site: yup.string().trim().required("Campo requerido"),
	supervisors: yup.string().trim().required("Campo requerido"),
})
