import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import { Pressable } from "react-native"
import { TextInput } from "react-native-paper"

type DateInputProps = {
	value?: string
	onChange: (value: string) => void
	error?: boolean
	placeholder?: string
	disabled?: boolean
}

function getDateValue(value: string | undefined) {
	return value ? new Date(value.split("/").reverse().join("-")) : new Date()
}

export function DateInput({
	value,
	onChange,
	error = false,
	placeholder = "DD/MM/YYYY",
	disabled = false,
}: DateInputProps) {
	const [show, setShow] = useState(false)

	return (
		<>
			<Pressable
				disabled={disabled}
				onPress={() => {
					if (!disabled) {
						setShow(true)
					}
				}}
			>
				<TextInput
					mode="outlined"
					value={value}
					placeholder={placeholder}
					editable={false}
					error={error}
					disabled={disabled}
					right={
						<TextInput.Icon
							icon="calendar"
							onPress={() => {
								if (!disabled) {
									setShow(true)
								}
							}}
						/>
					}
				/>
			</Pressable>

			{show && !disabled && (
				<DateTimePicker
					value={getDateValue(value)}
					mode="date"
					display="default"
					onChange={(event, selectedDate) => {
						setShow(false)
						if (event.type === "set" && selectedDate) {
							onChange(selectedDate.toLocaleDateString("es-ES"))
						}
					}}
				/>
			)}
		</>
	)
}
