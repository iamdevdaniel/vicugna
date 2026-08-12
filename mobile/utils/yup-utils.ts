import * as yup from "yup"

// ==========================================
// NUMERIC
// ==========================================

const numericTextPattern = /^-?(?:\d+|\d*\.\d+)$/

export function yupRequiredNumericText() {
	return yup
		.string()
		.required("Campo requerido")
		.matches(numericTextPattern, "Debe ser un número")
}

export function yupRequiredPositiveNumericText() {
	return yupRequiredNumericText().test(
		"is-positive",
		"Debe ser mayor a 0",
		(value) => Number(value) > 0,
	)
}

export function yupRequiredPositiveIntegerText() {
	return yup
		.string()
		.required("Campo requerido")
		.test("is-non-negative", "No puede ser negativo", (value) => {
			return !value?.startsWith("-")
		})
		.matches(/^\d+$/, "Debe contener solo números enteros")
		.test("is-positive", "Debe ser mayor a 0", (value) => {
			if (!value) return false
			return /[1-9]/.test(value)
		})
}
