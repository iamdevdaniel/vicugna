import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { useAppTheme } from "@utils/useAppTheme"
import { useState } from "react"
import { Pressable, Text } from "react-native"
import { IconButton } from "react-native-paper"

type TimeInputProps = {
	value?: string
	onChange: (value: string) => void
	error?: boolean
	placeholder?: string
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
	error,
	placeholder = "Seleccionar hora",
}: TimeInputProps) {
	const theme = useAppTheme()
	const [show, setShow] = useState(false)

	const handleTimeChange = (
		event: DateTimePickerEvent,
		selectedDate?: Date,
	) => {
		setShow(false)
		if (event.type === "set" && selectedDate) {
			const hours = selectedDate.getHours().toString().padStart(2, "0")
			const minutes = selectedDate
				.getMinutes()
				.toString()
				.padStart(2, "0")
			onChange(`${hours}:${minutes}`)
		}
	}

	return (
		<>
			<Pressable
				onPress={() => setShow(true)}
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

			{show && (
				<DateTimePicker
					value={
						value ? new Date(`1970-01-01T${value}:00`) : new Date()
					}
					mode="time"
					is24Hour={true}
					display="spinner"
					locale="es-ES"
					positiveButton={{
						label: "Aceptar",
						textColor: theme.colors.primary,
					}}
					negativeButton={{
						label: "Cancelar",
						textColor: theme.colors.error,
					}}
					onChange={handleTimeChange}
				/>
			)}
		</>
	)
}
