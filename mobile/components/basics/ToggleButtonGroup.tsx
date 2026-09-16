import { useAppTheme } from "@utils/useAppTheme"
import type React from "react"
import {
	Keyboard,
	type StyleProp,
	StyleSheet,
	View,
	type ViewStyle,
} from "react-native"
import { RadioButton } from "react-native-paper"

export type ToggleOption = {
	label: string
	value: string
}

export type ToggleButtonGroupProps = {
	value: string
	onChange: (value: string) => void
	options: ToggleOption[]
	accessibilityLabel?: string
	style?: StyleProp<ViewStyle>
	disabled?: boolean
	columns?: number
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
	value,
	onChange,
	options,
	accessibilityLabel,
	style,
	disabled = false,
	columns,
}) => {
	const theme = useAppTheme()
	const columnCount =
		columns && columns > 0 ? columns : Math.max(options.length, 1)
	const isMultiRow = Boolean(columns && options.length > columnCount)
	const selectedColor = disabled
		? theme.colors.onSurfaceVariant
		: theme.colors.secondary
	const unselectedColor = disabled
		? theme.colors.onSurfaceVariant
		: theme.colors.onSurface
	const unselectedIconColor = disabled
		? theme.colors.onSurfaceVariant
		: theme.colors.onSurfaceVariant
	const selectOption = (optionValue: string) => {
		Keyboard.dismiss()
		onChange(optionValue)
	}

	return (
		<RadioButton.Group value={value} onValueChange={selectOption}>
			<View
				style={[
					styles.grid,
					isMultiRow ? styles.multiRowGrid : styles.singleRowGrid,
					style,
				]}
			>
				{options.map((opt) => {
					const selected = value === opt.value
					const optionLabel = accessibilityLabel
						? `${accessibilityLabel}: ${opt.label}`
						: opt.label

					return (
						<View
							key={opt.value}
							style={
								isMultiRow
									? { width: `${100 / columnCount}%` }
									: undefined
							}
						>
							<RadioButton.Item
								value={opt.value}
								label={opt.label}
								disabled={disabled}
								mode="android"
								position="leading"
								color={selectedColor}
								uncheckedColor={unselectedIconColor}
								accessibilityLabel={`${optionLabel}, ${
									selected
										? "Seleccionado"
										: "No seleccionado"
								}`}
								style={[
									styles.gridButton,
									isMultiRow
										? styles.multiRowButton
										: undefined,
								]}
								labelStyle={[
									styles.gridButtonLabel,
									{
										color: selected
											? selectedColor
											: unselectedColor,
									},
								]}
							/>
						</View>
					)
				})}
			</View>
		</RadioButton.Group>
	)
}

const styles = StyleSheet.create({
	grid: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
	},
	singleRowGrid: {
		columnGap: 24,
	},
	multiRowGrid: {
		rowGap: 0,
	},
	gridButton: {
		minHeight: 44,
		justifyContent: "flex-start",
		paddingHorizontal: 0,
		paddingVertical: 6,
	},
	multiRowButton: {
		width: "100%",
		minHeight: 36,
		paddingVertical: 2,
	},
	gridButtonLabel: {
		flexGrow: 0,
		flexShrink: 1,
		fontSize: 14,
		fontWeight: "600",
		textAlign: "left",
	},
})
