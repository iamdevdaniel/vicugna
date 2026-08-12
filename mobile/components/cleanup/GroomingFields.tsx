import type { GroomingFormData } from "@definitions/types"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { TextInput } from "react-native-paper"
import { LabeledInput } from "../basics/LabeledInput"

type GroomingFieldsProps = {
	control: Control<GroomingFormData>
	errors: FieldErrors<GroomingFormData>
	disabled: boolean
	startIndex: number
}

export function GroomingFields({
	control,
	errors,
	disabled,
	startIndex,
}: GroomingFieldsProps) {
	return (
		<>
			<LabeledInput
				label="Peso vellon limpio"
				labelPrefix={String(startIndex)}
				labelSuffix="gramos"
				error={errors.cleanWeight?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="cleanWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.cleanWeight}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso braga"
				labelPrefix={String(startIndex + 1)}
				labelSuffix="gramos"
				error={errors.dirtyWeight?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="dirtyWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.dirtyWeight}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso total fibra"
				labelPrefix={String(startIndex + 2)}
				labelSuffix="gramos"
				error={errors.totalWeight?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="totalWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.totalWeight}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>
		</>
	)
}
