import { useAppTheme } from "@utils/useAppTheme"
import type React from "react"
import {
	Keyboard,
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native"
import { Icon } from "react-native-paper"

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
		<View
			style={[
				styles.grid,
				isMultiRow ? styles.multiRowGrid : styles.singleRowGrid,
				style,
			]}
		>
			{options.map((opt) => {
				const selected = value === opt.value

				return (
					<Pressable
						key={opt.value}
						disabled={disabled}
						onPress={() => selectOption(opt.value)}
						accessibilityRole="radio"
						accessibilityLabel={
							accessibilityLabel
								? `${accessibilityLabel}: ${opt.label}`
								: opt.label
						}
						accessibilityState={{ checked: selected, disabled }}
						accessibilityValue={{
							text: selected ? "Seleccionado" : "No seleccionado",
						}}
						style={[
							styles.gridButton,
							isMultiRow
								? { width: `${100 / columnCount}%` }
								: undefined,
							isMultiRow ? styles.multiRowButton : undefined,
						]}
					>
						<View style={styles.gridButtonContent}>
							<Icon
								source={
									selected
										? "radiobox-marked"
										: "radiobox-blank"
								}
								size={20}
								color={
									selected
										? selectedColor
										: unselectedIconColor
								}
							/>
							<Text
								style={[
									styles.gridButtonLabel,
									{
										color: selected
											? selectedColor
											: unselectedColor,
									},
								]}
							>
								{opt.label}
							</Text>
						</View>
					</Pressable>
				)
			})}
		</View>
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
		alignItems: "flex-start",
		justifyContent: "center",
		paddingVertical: 6,
	},
	multiRowButton: {
		minHeight: 36,
		paddingVertical: 2,
	},
	gridButtonContent: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: 6,
	},
	gridButtonLabel: {
		flexShrink: 1,
		fontSize: 14,
		fontWeight: "600",
		textAlign: "left",
	},
})
