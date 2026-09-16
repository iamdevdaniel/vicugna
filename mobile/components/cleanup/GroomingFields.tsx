import type { GroomingFormData } from "@definitions/types"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Icon } from "react-native-paper"
import { CustomTextInput } from "../basics/CustomTextInput"
import { LabeledInput } from "../basics/LabeledInput"

type GroomingFieldsProps = {
	control: Control<GroomingFormData>
	errors: FieldErrors<GroomingFormData>
	startIndex: number
	disabled: boolean
}

export function GroomingFields({
	control,
	errors,
	startIndex,
	disabled,
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
						<CustomTextInput
							accessibilityLabel="Fibra: peso vellón limpio"
							dense
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.cleanWeight}
							editable={!disabled}
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
						<CustomTextInput
							accessibilityLabel="Fibra: peso braga"
							dense
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.dirtyWeight}
							editable={!disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label={
					<>
						Peso total fibra{" "}
						<Icon source="lock-outline" size={18} />
					</>
				}
				labelPrefix={String(startIndex + 2)}
				labelSuffix="gramos"
				disabled
			>
				<Controller
					control={control}
					name="totalWeight"
					render={({ field: { value } }) => (
						<CustomTextInput
							accessibilityLabel="Fibra: peso total"
							dense
							value={value}
							editable={false}
						/>
					)}
				/>
			</LabeledInput>
		</>
	)
}
