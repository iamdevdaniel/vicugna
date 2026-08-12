import type {
	CleaningCommonFormData,
	DehearingFormData,
	GroomingFormData,
} from "@definitions/types"
import * as yup from "yup"
import {
	yupRequiredPositiveIntegerText,
	yupRequiredPositiveNumericText,
} from "./yup-utils"

export const defaultValuesCleaningCommon: CleaningCommonFormData = {
	fleeceNumber: "",
	grossWeight: "",
}

export const defaultValuesGrooming: GroomingFormData = {
	cleanWeight: "",
	dirtyWeight: "",
	totalWeight: "",
}

export const defaultValuesDehearing: DehearingFormData = {
	dehairedWeight: "",
	bristleWeight: "",
	hasDandruff: false,
	dehairerName: "",
	signature: "",
}

export const yupCleaningCommon: yup.ObjectSchema<CleaningCommonFormData> =
	yup.object({
		fleeceNumber: yupRequiredPositiveIntegerText(),
		grossWeight: yupRequiredPositiveNumericText(),
	})

export const yupGrooming: yup.ObjectSchema<GroomingFormData> = yup.object({
	cleanWeight: yupRequiredPositiveNumericText(),
	dirtyWeight: yupRequiredPositiveNumericText(),
	totalWeight: yupRequiredPositiveNumericText(),
})

export const yupDehearing: yup.ObjectSchema<DehearingFormData> = yup.object({
	dehairedWeight: yupRequiredPositiveNumericText(),
	bristleWeight: yupRequiredPositiveNumericText(),
	hasDandruff: yup.boolean().defined().required("Campo requerido"),
	dehairerName: yup.string().required("Campo requerido"),
	signature: yup.string().required("Campo requerido"),
})
