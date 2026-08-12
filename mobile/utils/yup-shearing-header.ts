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
	latitude: yupRequiredNumericText(),
	longitude: yupRequiredNumericText(),
	roundupCount: yupRequiredNumericText()
		.test("is-integer", "Debe ser un número entero", (value) => {
			if (!value) {
				return false
			}

			return Number.isInteger(Number(value))
		})
		.test("is-positive", "Debe ser mayor a 0", (value) => {
			if (!value) {
				return false
			}

			return Number(value) > 0
		}),
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
