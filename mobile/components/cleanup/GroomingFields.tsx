import type { GroomingFormData } from "@definitions/types"
import { useAppTheme } from "@utils/useAppTheme"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Icon, TextInput } from "react-native-paper"
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
	const theme = useAppTheme()

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
						<TextInput
							mode="outlined"
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
						<TextInput
							mode="outlined"
							value={value}
							editable={false}
							textColor={theme.colors.custom.white}
							style={{
								backgroundColor: theme.colors.custom.darkGray,
							}}
						/>
					)}
				/>
			</LabeledInput>
		</>
	)
}
