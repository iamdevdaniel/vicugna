import type { Form11Dehearing, Form11Record, Form11Shearing } from "@definitions/types"
import * as yup from "yup"

const decimalNumberRegex = /^\d+(\.\d{1,2})?$/

export const schemaForm11Shearing = yup.object().shape({
	departamento: yup.string().required("Requerido"),
	asociacionRegional: yup.string().required("Requerido"),
	comunidadManejadora: yup.string().required("Requerido"),
	sitioCaptura: yup.string().required("Requerido"),
	fechaCaptura: yup.string().required("Requerido"),
	codigoAutorizacion: yup.string().required("Requerido"),
})

export const defaultValuesForm11Shearing: Form11Shearing = {
	departamento: "",
	asociacionRegional: "",
	comunidadManejadora: "",
	sitioCaptura: "",
	fechaCaptura: "",
	codigoAutorizacion: "",
}

export const schemaForm11Dehearing = yup.object().shape({
	fechaInicioPredescerdado: yup.string().required("Requerido"),
	fechaFinPredescerdado: yup.string().required("Requerido"),
	lugarPredescerdado: yup.string().required("Requerido"),
	responsablesPredescerdado: yup.string().required("Requerido"),
})

export const defaultValuesForm11Dehearing: Form11Dehearing = {
	fechaInicioPredescerdado: "",
	fechaFinPredescerdado: "",
	lugarPredescerdado: "",
	responsablesPredescerdado: "",
}

export const schemaForm11Record = yup.object().shape({
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

export const defaultValuesForm11Record: Form11Record = {
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
