import type {
	CleaningCommonFormData,
	DehearingFormData,
	GroomingFormData,
} from "@definitions/types"
import * as yup from "yup"

export const defaultValuesCleaningCommon: CleaningCommonFormData = {
	fleeceNumber: "",
	grossWeight: 0,
}

export const defaultValuesGrooming: GroomingFormData = {
	cleanWeight: 0,
	dirtyWeight: 0,
	totalWeight: 0,
}

export const defaultValuesDehearing: DehearingFormData = {
	dehairedWeight: 0,
	bristleWeight: 0,
	hasDandruff: false,
	dehairerName: "",
	signature: "",
}

export const yupCleaningCommon: yup.ObjectSchema<CleaningCommonFormData> =
	yup.object({
		fleeceNumber: yup.string().required("Campo requerido"),
		grossWeight: yup
			.number()
			.typeError("Debe ser un numero")
			.moreThan(0, "Debe ser mayor a 0")
			.required("Campo requerido"),
	})

export const yupGrooming: yup.ObjectSchema<GroomingFormData> = yup.object({
	cleanWeight: yup
		.number()
		.typeError("Debe ser un numero")
		.moreThan(0, "Debe ser mayor a 0")
		.required("Campo requerido"),
	dirtyWeight: yup
		.number()
		.typeError("Debe ser un numero")
		.moreThan(0, "Debe ser mayor a 0")
		.required("Campo requerido"),
	totalWeight: yup
		.number()
		.typeError("Debe ser un numero")
		.moreThan(0, "Debe ser mayor a 0")
		.required("Campo requerido"),
})

export const yupDehearing: yup.ObjectSchema<DehearingFormData> = yup.object({
	dehairedWeight: yup
		.number()
		.typeError("Debe ser un numero")
		.moreThan(0, "Debe ser mayor a 0")
		.required("Campo requerido"),
	bristleWeight: yup
		.number()
		.typeError("Debe ser un numero")
		.moreThan(0, "Debe ser mayor a 0")
		.required("Campo requerido"),
	hasDandruff: yup.boolean().defined().required("Campo requerido"),
	dehairerName: yup.string().required("Campo requerido"),
	signature: yup.string().required("Campo requerido"),
})
