import { useAppTheme } from "@utils/useAppTheme"
import { useState } from "react"
import { Pressable, Text } from "react-native"
import { IconButton } from "react-native-paper"
import {
	es,
	registerTranslation,
	TimePickerModal,
} from "react-native-paper-dates"

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
	const theme = useAppTheme()
	const [show, setShow] = useState(false)
	const [hours, minutes] = value?.split(":").map(Number) ?? []

	return (
		<>
			<Pressable
				onPress={() => {
					if (!disabled) setShow(true)
				}}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={{
					text: formatDisplayTime(value) ?? placeholder,
				}}
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					borderWidth: 1,
					borderColor: error
						? theme.colors.error
						: theme.colors.outline,
					borderRadius: 4,
					paddingHorizontal: 12,
					height: 56,
					backgroundColor: theme.colors.surface,
					marginVertical: 4,
					opacity: disabled ? 0.6 : 1,
				}}
			>
				<Text
					style={{
						fontSize: 16,
						color: value
							? theme.colors.onSurface
							: theme.colors.custom.lightGray,
					}}
				>
					{formatDisplayTime(value) ?? placeholder}
				</Text>
				<IconButton
					icon="clock-outline"
					size={24}
					iconColor={theme.colors.onSurfaceVariant}
					style={{ margin: 0 }}
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
