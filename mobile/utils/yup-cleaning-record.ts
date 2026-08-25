import type {
	CleaningCommonFormData,
	DehearingFormData,
	GroomingFormData,
} from "@definitions/types"
import * as yup from "yup"
import {
	calculateTotalWeight,
	isWeightLessThanOrEqual,
} from "./grooming-record-rules"
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
	cleanWeight: yupRequiredPositiveNumericText().test(
		"clean-weight-within-gross",
		"No puede superar el peso bruto",
		function (value) {
			return isWeightWithinGross(value, this)
		},
	),
	dirtyWeight: yupRequiredPositiveNumericText()
		.test(
			"dirty-weight-within-gross",
			"No puede superar el peso bruto",
			function (value) {
				return isWeightWithinGross(value, this)
			},
		)
		.test(
			"combined-weight-within-gross",
			"La suma de ambos pesos no puede superar el peso bruto",
			function (value) {
				const grossWeight = getGrossWeight(this)
				const cleanWeight = this.parent.cleanWeight
				const totalWeight = calculateTotalWeight(cleanWeight, value)

				if (!totalWeight) {
					return true
				}
				if (
					isWeightLessThanOrEqual(cleanWeight, grossWeight) ===
						false ||
					isWeightLessThanOrEqual(value, grossWeight) === false
				) {
					return true
				}

				return isWeightLessThanOrEqual(totalWeight, grossWeight) ?? true
			},
		),
	totalWeight: yup.string().defined(),
})

function isWeightWithinGross(
	value: string | undefined,
	context: yup.TestContext,
) {
	const grossWeight = getGrossWeight(context)

	return value ? (isWeightLessThanOrEqual(value, grossWeight) ?? true) : true
}

function getGrossWeight(context: yup.TestContext): string {
	const grossWeight = context.resolve(yup.ref("$grossWeight"))
	return typeof grossWeight === "string" ? grossWeight : ""
}

export const yupDehearing: yup.ObjectSchema<DehearingFormData> = yup.object({
	dehairedWeight: yupRequiredPositiveNumericText(),
	bristleWeight: yupRequiredPositiveNumericText(),
	hasDandruff: yup.boolean().defined().required("Campo requerido"),
	dehairerName: yup.string().required("Campo requerido"),
	signature: yup.string().required("Campo requerido"),
})
