import type { Form11Body, Form11Header } from "@types"
import * as yup from "yup"

const decimalNumberRegex = /^\d+(\.\d{1,2})?$/

export const schemaForm11Header = yup.object().shape({
	asociacionRegional: yup.string().required("Requerido"),
	comunidadManejadora: yup.string().required("Requerido"),
	sitioCaptura: yup.string().required("Requerido"),
	fechaCaptura: yup.string().required("Requerido"),
	codigoAutorizacion: yup.string().required("Requerido"),
	fechaInicioPredescerdado: yup.string().required("Requerido"),
	fechaFinPredescerdado: yup.string().required("Requerido"),
	lugarPredescerdado: yup.string().required("Requerido"),
	responsablesPredescerdado: yup.string().required("Requerido"),
})

export const defaultValuesForm11Header: Form11Header = {
	asociacionRegional: "",
	comunidadManejadora: "",
	sitioCaptura: "",
	fechaCaptura: "",
	codigoAutorizacion: "",
	fechaInicioPredescerdado: "",
	fechaFinPredescerdado: "",
	lugarPredescerdado: "",
	responsablesPredescerdado: "",
}

export const schemaForm11Body = yup.object().shape({
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

export const defaultValuesForm11Body: Form11Body = {
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
