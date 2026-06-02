import type { ShearingRecordFormData } from "@definitions/types"
import * as yup from "yup"

export const defaultValuesShearingRecord: ShearingRecordFormData = {
	tagNumber: 0,
	sex: "M",
	ageCategory: "Adulto",
	liveWeight: 0,
	fiberLength: 0,
	bodyCondition: "Bueno",
	gestationStatus: "No",
	externalParasites: null,
	mangeSeverity: null,
	hasDandruff: false,
	isSheared: false,
	isDead: false,
	observations: "",
}

export const yupShearingRecord: yup.ObjectSchema<ShearingRecordFormData> =
	yup.object({
		tagNumber: yup
			.number()
			.typeError("Debe ser un numero")
			.min(0, "No puede ser negativo")
			.required("Campo requerido"),
		sex: yup
			.mixed<"F" | "M">()
			.oneOf(["F", "M"], "Selecciona una opcion")
			.defined()
			.required("Campo requerido"),
		ageCategory: yup
			.mixed<"Cria" | "Juvenil" | "Adulto">()
			.oneOf(["Cria", "Juvenil", "Adulto"], "Selecciona una opcion")
			.defined()
			.required("Campo requerido"),
		liveWeight: yup
			.number()
			.typeError("Debe ser un numero")
			.min(0, "No puede ser negativo")
			.required("Campo requerido"),
		fiberLength: yup
			.number()
			.typeError("Debe ser un numero")
			.min(0, "No puede ser negativo")
			.required("Campo requerido"),
		bodyCondition: yup
			.mixed<"Malo" | "Regular" | "Bueno">()
			.oneOf(["Malo", "Regular", "Bueno"], "Selecciona una opcion")
			.defined()
			.required("Campo requerido"),
		gestationStatus: yup
			.mixed<"No" | "Si" | "Si ultimo tercio">()
			.oneOf(["No", "Si", "Si ultimo tercio"], "Selecciona una opcion")
			.defined()
			.required("Campo requerido"),
		externalParasites: yup
			.mixed<"Garrapata" | "Piojos">()
			.oneOf(["Garrapata", "Piojos"], "Selecciona una opcion")
			.nullable()
			.defined(),
		mangeSeverity: yup
			.mixed<"Leve" | "Moderado" | "Severo">()
			.oneOf(["Leve", "Moderado", "Severo"], "Selecciona una opcion")
			.nullable()
			.defined(),
		hasDandruff: yup.boolean().defined().required("Campo requerido"),
		isSheared: yup.boolean().defined().required("Campo requerido"),
		isDead: yup.boolean().defined().required("Campo requerido"),
		observations: yup.string().defined(),
	})
