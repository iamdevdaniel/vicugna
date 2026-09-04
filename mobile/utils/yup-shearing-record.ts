import type {
	ExternalParasiteData,
	ShearingRecordFormData,
} from "@definitions/types"
import * as yup from "yup"
import { canHaveGestation } from "./shearing-record-rules"
import {
	yupRequiredPositiveIntegerText,
	yupRequiredPositiveNumericText,
} from "./yup-utils"

export const defaultValuesShearingRecord: ShearingRecordFormData = {
	tagNumber: "",
	sex: "M",
	ageCategory: "Adulto",
	liveWeight: "",
	fiberLength: "",
	bodyCondition: "Bueno",
	gestationStatus: "No",
	externalParasites: [],
	mangeSeverity: "Ninguna",
	hasDandruff: false,
	isSheared: true,
	isDead: false,
	observations: "",
}

export const yupShearingRecord: yup.ObjectSchema<ShearingRecordFormData> = yup
	.object({
		tagNumber: yupRequiredPositiveIntegerText(2_147_483_647),
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
		liveWeight: yupRequiredPositiveNumericText(100, "kg"),
		fiberLength: yupRequiredPositiveNumericText(15, "cm"),
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
			.array()
			.of(
				yup
					.mixed<ExternalParasiteData>()
					.oneOf(["Garrapata", "Piojos"], "Selecciona una opción")
					.defined(),
			)
			.max(2)
			.defined(),
		mangeSeverity: yup
			.mixed<"Ninguna" | "Leve" | "Moderado" | "Severo">()
			.oneOf(
				["Ninguna", "Leve", "Moderado", "Severo"],
				"Selecciona una opcion",
			)
			.defined(),
		hasDandruff: yup.boolean().defined().required("Campo requerido"),
		isSheared: yup.boolean().defined().required("Campo requerido"),
		isDead: yup.boolean().defined().required("Campo requerido"),
		observations: yup.string().defined(),
	})
	.test(
		"gestation-requires-adult-female",
		"Solo una hembra adulta puede estar en gestación",
		(data, context) => {
			if (
				data.gestationStatus === "No" ||
				canHaveGestation(data.sex, data.ageCategory)
			) {
				return true
			}

			return context.createError({ path: "gestationStatus" })
		},
	)
