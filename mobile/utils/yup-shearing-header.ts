import type { ShearingHeaderFormData } from "@definitions/types"
import * as yup from "yup"
import {
	yupRequiredNumericTextInRange,
	yupRequiredPositiveIntegerText,
} from "./yup-utils"

export const defaultValuesShearingHeader: ShearingHeaderFormData = {
	site: "",
	latitude: "",
	longitude: "",
	roundupCount: "",
	eventDate: "",
	startTime: "",
	endTime: "",
}

function parseTimeToMinutes(value: string) {
	const [hoursText = "", minutesText = ""] = value.split(":")
	const hours = Number(hoursText)
	const minutes = Number(minutesText)

	if (
		Number.isNaN(hours) ||
		Number.isNaN(minutes) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59
	) {
		return Number.NaN
	}

	return hours * 60 + minutes
}

export const yupShearingHeader = yup.object().shape({
	site: yup.string().required("Campo requerido"),
	latitude: yupRequiredNumericTextInRange(-90, 90),
	longitude: yupRequiredNumericTextInRange(-180, 180),
	roundupCount: yupRequiredPositiveIntegerText(),
	eventDate: yup.string().required("Campo requerido"),
	startTime: yup.string().required("Campo requerido"),
	endTime: yup
		.string()
		.required("Campo requerido")
		.test(
			"is-after-start-time",
			"La hora final debe ir después",
			(value, context) => {
				if (!value) {
					return false
				}

				const startTime = context.parent.startTime

				if (!startTime) {
					return true
				}

				return parseTimeToMinutes(value) > parseTimeToMinutes(startTime)
			},
		),
})
