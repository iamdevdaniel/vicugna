import type { GroomingFormData } from "@definitions/types"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { TextInput } from "react-native-paper"
import { LabeledInput } from "../basics/LabeledInput"

type GroomingFieldsProps = {
	control: Control<GroomingFormData>
	errors: FieldErrors<GroomingFormData>
}

function formatNumber(value: number) {
	return Number.isFinite(value) ? value.toString() : ""
}

function parseNumber(value: string) {
	const digits = value.replace(/\D/g, "")
	return digits === "" ? Number.NaN : Number(digits)
}

export function GroomingFields({ control, errors }: GroomingFieldsProps) {
	return (
		<>
			<LabeledInput
				label="Peso vellon limpio"
				labelPrefix="2"
				labelSuffix="gramos"
				error={errors.cleanWeight?.message}
			>
				<Controller
					control={control}
					name="cleanWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={formatNumber(value)}
							onChangeText={(text) => onChange(parseNumber(text))}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.cleanWeight}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso braga"
				labelPrefix="3"
				labelSuffix="gramos"
				error={errors.dirtyWeight?.message}
			>
				<Controller
					control={control}
					name="dirtyWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={formatNumber(value)}
							onChangeText={(text) => onChange(parseNumber(text))}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.dirtyWeight}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso total fibra"
				labelPrefix="4"
				labelSuffix="gramos"
				error={errors.totalWeight?.message}
			>
				<Controller
					control={control}
					name="totalWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={formatNumber(value)}
							onChangeText={(text) => onChange(parseNumber(text))}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.totalWeight}
						/>
					)}
				/>
			</LabeledInput>
		</>
	)
}
