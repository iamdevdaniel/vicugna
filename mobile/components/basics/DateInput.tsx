import { useState } from "react"
import { Pressable, type StyleProp, type ViewStyle } from "react-native"
import { TextInput } from "react-native-paper"
import {
	DatePickerModal,
	es,
	registerTranslation,
} from "react-native-paper-dates"

registerTranslation("es", es)

type DateInputProps = {
	value?: string
	onChange: (value: string) => void
	accessibilityLabel?: string
	error?: boolean
	placeholder?: string
	disabled?: boolean
	style?: StyleProp<ViewStyle>
}

export function getTodayDateString() {
	return new Date().toLocaleDateString("es-ES")
}

function getDateValue(value: string | undefined) {
	if (!value) return new Date()
	const [day, month, year] = value.split("/").map(Number)
	return new Date(year, month - 1, day)
}

export function DateInput({
	value,
	onChange,
	accessibilityLabel,
	error = false,
	placeholder = "DD/MM/YYYY",
	disabled = false,
	style,
}: DateInputProps) {
	const [show, setShow] = useState(false)

	return (
		<>
			<Pressable
				style={style}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={{ text: value || placeholder }}
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

			<DatePickerModal
				locale="es"
				mode="single"
				visible={show && !disabled}
				date={getDateValue(value)}
				onDismiss={() => setShow(false)}
				onConfirm={({ date }) => {
					setShow(false)
					if (date) onChange(date.toLocaleDateString("es-ES"))
				}}
			/>
		</>
	)
}
