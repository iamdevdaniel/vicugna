import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form"
import {
	Switch,
	type SwitchProps,
	TextInput,
	type TextInputProps,
} from "react-native-paper"
import { RadioGroup, type RadioOption } from "./RadioGroup"

export type InputSelectorProps<T extends FieldValues> = {
	type: "number" | "text" | "boolean" | "radio"
	control: Control<T>
	name: Path<T>
	options?: RadioOption[]
}

export const InputSelector = <T extends FieldValues>({
	type,
	control,
	name,
	options,
	...props
}: InputSelectorProps<T>) => {
	console.log("options", options)

	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => {
				switch (type) {
					case "boolean":
						return (
							<Switch
								value={!!value}
								onValueChange={onChange}
								{...(props as SwitchProps)}
							/>
						)
					case "number":
						return (
							<TextInput
								value={value !== undefined ? String(value) : ""}
								onChangeText={onChange}
								keyboardType="numeric"
								{...(props as TextInputProps)}
							/>
						)
					case "radio":
						return (
							<RadioGroup
								value={value}
								onChange={onChange}
								options={options || []}
								{...props}
							/>
						)

					default:
						return (
							<TextInput
								value={value !== undefined ? String(value) : ""}
								onChangeText={onChange}
								{...(props as TextInputProps)}
							/>
						)
				}
			}}
		/>
	)
}
