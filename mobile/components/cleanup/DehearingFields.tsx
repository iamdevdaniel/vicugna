import type { DehearingFormData } from "@definitions/types"
import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { TextInput } from "react-native-paper"
import { LabeledInput } from "../basics/LabeledInput"
import { SignaturePad } from "../basics/SignaturePad"
import { ToggleButtonGroup } from "../basics/ToggleButtonGroup"

type DehearingFieldsProps = {
	control: Control<DehearingFormData>
	errors: FieldErrors<DehearingFormData>
	disabled: boolean
	startIndex: number
}

function formatNumber(value: number) {
	return Number.isFinite(value) ? value.toString() : ""
}

function parseNumber(value: string) {
	const digits = value.replace(/\D/g, "")
	return digits === "" ? Number.NaN : Number(digits)
}

export function DehearingFields({
	control,
	errors,
	disabled,
	startIndex,
}: DehearingFieldsProps) {
	return (
		<>
			<LabeledInput
				label="Peso fibra predescerdada"
				labelPrefix={String(startIndex)}
				labelSuffix="gramos"
				error={errors.dehairedWeight?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="dehairedWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={formatNumber(value)}
							onChangeText={(text) => onChange(parseNumber(text))}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.dehairedWeight}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Peso cerda"
				labelPrefix={String(startIndex + 1)}
				labelSuffix="gramos"
				error={errors.bristleWeight?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="bristleWeight"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							mode="outlined"
							value={formatNumber(value)}
							onChangeText={(text) => onChange(parseNumber(text))}
							onBlur={onBlur}
							keyboardType="numeric"
							error={!!errors.bristleWeight}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Caspa"
				labelPrefix={String(startIndex + 2)}
				disabled={disabled}
			>
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
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Nombre del predescerdador (a)"
				labelPrefix={String(startIndex + 3)}
				error={errors.dehairerName?.message}
				disabled={disabled}
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
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>

			<LabeledInput
				label="Firma"
				labelPrefix={String(startIndex + 4)}
				error={errors.signature?.message}
				disabled={disabled}
			>
				<Controller
					control={control}
					name="signature"
					render={({ field: { onChange, value } }) => (
						<SignaturePad
							value={value}
							onChange={onChange}
							disabled={disabled}
						/>
					)}
				/>
			</LabeledInput>
		</>
	)
}
