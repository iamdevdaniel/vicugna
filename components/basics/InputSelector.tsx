import type React from "react"
import {
	Switch,
	type SwitchProps,
	TextInput,
	type TextInputProps,
} from "react-native-paper"

export type InputSelectorProps = {
	type: "number" | "text" | "boolean"
	value: string | boolean
	onChange: (value: string | boolean) => void
}

export const InputSelector: React.FC<InputSelectorProps> = ({
	type,
	value,
	onChange,
	...props
}) => {
	if (type === "boolean") {
		return (
			<Switch
				value={!!value}
				onValueChange={(v) => onChange(v)}
				{...(props as SwitchProps)}
			/>
		)
	}
	if (type === "number") {
		return (
			<TextInput
				value={value !== undefined ? String(value) : ""}
				onChangeText={onChange}
				keyboardType="numeric"
				{...(props as TextInputProps)}
			/>
		)
	}
	return (
		<TextInput
			value={value !== undefined ? String(value) : ""}
			onChangeText={(v) => onChange(v)}
			{...(props as TextInputProps)}
		/>
	)
}
