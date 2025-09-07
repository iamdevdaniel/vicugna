import type { Form11Data } from "@types"
import * as yup from "yup"

const decimalNumberRegex = /^\d+(\.\d{1,2})?$/

export const schema = yup.object().shape({
	ficha: yup.string().required("Requerido"),
	pesoFibraBruto: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	pesoVellonLimpio: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	pesoBraga: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	pesoTotalFibra: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	pesoFibraPredescerdada: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	pesoCerda: yup
		.string()
		.required("Requerido")
		.test(
			"is-number",
			"Debe ser un número",
			(val) => !Number.isNaN(Number(val)),
		)
		.test("decimals", "Máximo 2 decimales", (val) =>
			decimalNumberRegex.test(val || ""),
		),
	caspa: yup
		.string()
		.oneOf(["SI", "NO"], "Debe ser SI o NO")
		.required("Requerido"),
	nombrePredescerdador: yup.string().required("Requerido"),
})

export const defaultValues: Form11Data = {
	ficha: "",
	pesoFibraBruto: "",
	pesoVellonLimpio: "",
	pesoBraga: "",
	pesoTotalFibra: "",
	pesoFibraPredescerdada: "",
	pesoCerda: "",
	caspa: "NO",
	nombrePredescerdador: "",
}
