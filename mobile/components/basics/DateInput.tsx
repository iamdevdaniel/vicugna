import { formatCalendarDate } from "@utils/calendar-date"
import { useState } from "react"
import {
	Keyboard,
	Pressable,
	type StyleProp,
	type ViewStyle,
} from "react-native"
import {
	DatePickerModal,
	es,
	registerTranslation,
} from "react-native-paper-dates"
import { CustomTextInput } from "./CustomTextInput"

registerTranslation("es-BO", es)

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
	return formatCalendarDate(new Date())
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
	const openPicker = () => {
		if (disabled) return
		Keyboard.dismiss()
		setShow(true)
	}

	return (
		<>
			<Pressable
				style={style}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={{ text: value || placeholder }}
				onPress={openPicker}
			>
				<CustomTextInput
					dense
					value={value}
					placeholder={placeholder}
					editable={false}
					error={error}
					disabled={disabled}
					rightIcon="calendar"
				/>
			</Pressable>

			<DatePickerModal
				locale="es-BO"
				mode="single"
				visible={show && !disabled}
				date={getDateValue(value)}
				onDismiss={() => setShow(false)}
				onConfirm={({ date }) => {
					setShow(false)
					if (date) onChange(formatCalendarDate(date))
				}}
			/>
		</>
	)
}
