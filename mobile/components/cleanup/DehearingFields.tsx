import type { DehearingFormData } from "@definitions/types"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { TextInput } from "react-native-paper"
import { LabeledInput } from "../basics/LabeledInput"
import { SignaturePad } from "../basics/SignaturePad"
import { ToggleButtonGroup } from "../basics/ToggleButtonGroup"

type DehearingFieldsProps = {
	control: Control<DehearingFormData>
	errors: FieldErrors<DehearingFormData>
	startIndex: number
}

export function DehearingFields({
	control,
	errors,
	startIndex,
}: DehearingFieldsProps) {
	return (
		<>
			<LabeledInput
				label="Peso fibra predescerdada"
				labelPrefix={String(startIndex)}
				labelSuffix="gramos"
				error={errors.dehairedWeight?.message}
			>
				<Controller
					control={control}
					name="dehairedWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.dehairedWeight}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso cerda"
				labelPrefix={String(startIndex + 1)}
				labelSuffix="gramos"
				error={errors.bristleWeight?.message}
			>
				<Controller
					control={control}
					name="bristleWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.bristleWeight}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput label="Caspa" labelPrefix={String(startIndex + 2)}>
				<Controller
					control={control}
					name="hasDandruff"
					render={({ field: { onChange, value } }) => (
						<ToggleButtonGroup
							value={value ? "Si" : "No"}
							onChange={(nextValue) =>
								onChange(nextValue === "Si")
							}
							options={[
								{ label: "No", value: "No" },
								{ label: "Si", value: "Si" },
							]}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Nombre del predescerdador (a)"
				labelPrefix={String(startIndex + 3)}
				error={errors.dehairerName?.message}
			>
				<Controller
					control={control}
					name="dehairerName"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							autoCapitalize="words"
							error={!!errors.dehairerName}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Firma"
				labelPrefix={String(startIndex + 4)}
				error={errors.signature?.message}
			>
				<Controller
					control={control}
					name="signature"
					render={({ field: { onChange, value } }) => (
						<SignaturePad value={value} onChange={onChange} />
					)}
				/>
			</LabeledInput>
		</>
	)
}
