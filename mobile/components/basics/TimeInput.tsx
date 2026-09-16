import { useState } from "react"
import { Keyboard, Pressable } from "react-native"
import {
	es,
	registerTranslation,
	TimePickerModal,
} from "react-native-paper-dates"
import { CustomTextInput } from "./CustomTextInput"

registerTranslation("es", es)

type TimeInputProps = {
	value?: string
	onChange: (value: string) => void
	accessibilityLabel?: string
	error?: boolean
	placeholder?: string
	disabled?: boolean
}

const formatDisplayTime = (time: string | undefined) => {
	if (!time) return null
	const [hours, minutes] = time.split(":").map(Number)
	const period = hours >= 12 ? "PM" : "AM"
	const h = hours % 12 || 12
	return `${h}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function TimeInput({
	value,
	onChange,
	accessibilityLabel,
	error,
	placeholder = "Seleccionar hora",
	disabled = false,
}: TimeInputProps) {
	const [show, setShow] = useState(false)
	const [hours, minutes] = value?.split(":").map(Number) ?? []
	const openPicker = () => {
		if (disabled) return
		Keyboard.dismiss()
		setShow(true)
	}

	return (
		<>
			<Pressable
				onPress={openPicker}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={{
					text: formatDisplayTime(value) ?? placeholder,
				}}
			>
				<CustomTextInput
					dense
					value={formatDisplayTime(value) ?? ""}
					placeholder={placeholder}
					editable={false}
					error={error}
					disabled={disabled}
					rightIcon="clock-outline"
				/>
			</Pressable>

			<TimePickerModal
				locale="es"
				label="Seleccionar hora"
				cancelLabel="Cancelar"
				confirmLabel="Aceptar"
				visible={show && !disabled}
				hours={hours}
				minutes={minutes}
				use24HourClock
				defaultInputType="picker"
				onDismiss={() => setShow(false)}
				onConfirm={(selectedTime) => {
					setShow(false)
					onChange(
						`${String(selectedTime.hours).padStart(2, "0")}:${String(selectedTime.minutes).padStart(2, "0")}`,
					)
				}}
			/>
		</>
	)
}
