import * as yup from "yup"

// ==========================================
// NUMERIC
// ==========================================

const numericTextPattern = /^-?(?:\d+|\d*\.\d+)$/
const positiveIntegerTextPattern = /^\d+$/

function formatBound(value: number, unit?: string) {
	const formattedValue = value.toLocaleString("es-BO")
	return unit ? `${formattedValue} ${unit}` : formattedValue
}

export function yupRequiredNumericText() {
	return yup
		.string()
		.required("Campo requerido")
		.matches(numericTextPattern, {
			message: "Debe ser un número",
			excludeEmptyString: true,
		})
}

export function yupRequiredNumericTextInRange(min: number, max: number) {
	return yupRequiredNumericText().test(
		"is-in-range",
		"Fuera del rango permitido",
		(value, context) => {
			if (!value || !numericTextPattern.test(value)) return true

			const number = Number(value)
			if (number < min) {
				return context.createError({
					message: `No puede ser menor a ${formatBound(min)}`,
				})
			}
			if (number > max) {
				return context.createError({
					message: `No puede superar ${formatBound(max)}`,
				})
			}

			return true
		},
	)
}

export function yupRequiredPositiveNumericText(max: number, unit?: string) {
	return yupRequiredNumericText().test(
		"is-within-positive-range",
		"Fuera del rango permitido",
		(value, context) => {
			if (!value || !numericTextPattern.test(value)) return true

			const number = Number(value)
			if (number <= 0) {
				return context.createError({
					message: `Debe ser mayor a ${formatBound(0, unit)}`,
				})
			}
			if (number > max) {
				return context.createError({
					message: `No puede superar ${formatBound(max, unit)}`,
				})
			}

			return true
		},
	)
}

export function yupRequiredPositiveIntegerText(max?: number) {
	const schema = yup
		.string()
		.required("Campo requerido")
		.matches(positiveIntegerTextPattern, {
			message: "Debe contener solo números enteros",
			excludeEmptyString: true,
		})

	return schema.test(
		"is-within-positive-range",
		"Fuera del rango permitido",
		(value, context) => {
			if (!value || !positiveIntegerTextPattern.test(value)) return true

			const number = Number(value)
			if (number <= 0) {
				return context.createError({ message: "Debe ser mayor a 0" })
			}
			if (max !== undefined && number > max) {
				return context.createError({
					message: `No puede superar ${formatBound(max)}`,
				})
			}

			return true
		},
	)
}
