import type { Form11RecordFormData } from "@definitions/types"
import * as yup from "yup"

const decimalNumberRegex = /^\d+(\.\d{1,2})?$/

export const schemaForm11Shearing = yup.object().shape({
	departament: yup.string().required("Requerido"),
	regional: yup.string().required("Requerido"),
	community: yup.string().required("Requerido"),
	site: yup.string().required("Requerido"),
	date: yup.string().required("Requerido"),
	codigoAutorizacion: yup.string().required("Requerido"),
})

export const defaultValuesForm11Shearing = {
	departament: "",
	regional: "",
	community: "",
	site: "",
	date: "",
	codigoAutorizacion: "",
}

export const schemaForm11Dehearing = yup.object().shape({
	startDate: yup.string().required("Requerido"),
	endDate: yup.string().required("Requerido"),
	site: yup.string().required("Requerido"),
	supervisors: yup.string().required("Requerido"),
})

export const defaultValuesForm11Dehearing = {
	startDate: "",
	endDate: "",
	site: "",
	supervisors: "",
}

export const schemaForm11Record = yup.object().shape({
	tagId: yup.string().required("Requerido"),
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

export const defaultValuesForm11Record: Form11RecordFormData = {
	tagId: "",
	pesoFibraBruto: "",
	pesoVellonLimpio: "",
	pesoBraga: "",
	pesoTotalFibra: "",
	pesoFibraPredescerdada: "",
	pesoCerda: "",
	caspa: "NO",
	nombrePredescerdador: "",
}
