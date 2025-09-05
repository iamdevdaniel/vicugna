import * as yup from "yup"

export const schema = yup.object().shape({
	ficha: yup.string().required("Requerido"),
	pesoFibraBruto: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoVellonLimpio: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoBraga: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoTotalFibra: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoFibraPredescerdada: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	pesoCerda: yup
		.number()
		.typeError("Debe ser un número")
		.positive("Debe ser positivo")
		.test("decimals", "Máximo 2 decimales", (val) =>
			/^\d+(\.\d{1,2})?$/.test(String(val)),
		)
		.required("Requerido"),
	caspa: yup.string().required("Requerido"),
	nombrePredescerdador: yup.string().required("Requerido"),
})
