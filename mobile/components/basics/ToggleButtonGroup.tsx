import { useAppTheme } from "@utils/useAppTheme"
import type React from "react"
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native"
import { Icon, SegmentedButtons } from "react-native-paper"

export type ToggleOption = {
	label: string
	value: string
}

export type ToggleButtonGroupProps = {
	value: string
	onChange: (value: string) => void
	options: ToggleOption[]
	style?: StyleProp<ViewStyle>
	disabled?: boolean
	columns?: number
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
	value,
	onChange,
	options,
	style,
	disabled = false,
	columns,
}) => {
	const theme = useAppTheme()
	const columnCount = columns && columns > 0 ? columns : 1
	const selectedBackgroundColor = disabled
		? theme.colors.custom.darkGray
		: theme.colors.secondary
	const selectedTextColor = disabled
		? theme.colors.custom.white
		: theme.colors.onSecondary
	const unselectedTextColor = theme.colors.onSurface

	if (columns) {
		return (
			<View
				style={[
					styles.grid,
					{
						borderColor: theme.colors.outlineVariant,
						backgroundColor: theme.colors.surface,
					},
					style,
				]}
			>
				{options.map((opt, index) => {
					const selected = value === opt.value
					const isLastColumn = (index + 1) % columnCount === 0
					const isLastRow = index >= options.length - columnCount

					return (
						<Pressable
							key={opt.value}
							disabled={disabled}
							onPress={() => onChange(opt.value)}
							accessibilityRole="radio"
							accessibilityState={{ checked: selected, disabled }}
							style={[
								styles.gridButton,
								{
									width: `${100 / columnCount}%`,
									backgroundColor: selected
										? selectedBackgroundColor
										: theme.colors.surface,
									borderColor: theme.colors.outlineVariant,
									borderRightWidth: isLastColumn ? 0 : 1,
									borderBottomWidth: isLastRow ? 0 : 1,
								},
							]}
						>
							<View style={styles.gridButtonContent}>
								<View style={styles.gridButtonIcon}>
									<Icon
										source={
											selected
												? "radiobox-marked"
												: "radiobox-blank"
										}
										size={20}
										color={
											selected
												? selectedTextColor
												: theme.colors.onSurfaceVariant
										}
									/>
								</View>
								<Text
									style={[
										styles.gridButtonLabel,
										{
											color: selected
												? selectedTextColor
												: theme.colors.onSurface,
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

	return (
		<View style={[styles.container, style]}>
			<SegmentedButtons
				value={value}
				onValueChange={onChange}
				buttons={options.map((opt) => ({
					value: opt.value,
					label: opt.label,
					icon: ({ size }) => {
						const selected = value === opt.value

						return (
							<Icon
								source={
									selected
										? "radiobox-marked"
										: "radiobox-blank"
								}
								size={size}
								color={
									selected
										? selectedTextColor
										: unselectedTextColor
								}
							/>
						)
					},
					disabled,
					checkedColor: selectedTextColor,
					uncheckedColor: theme.colors.onSurface,
					showSelectedCheck: false,
					style: {
						backgroundColor:
							value === opt.value
								? selectedBackgroundColor
								: theme.colors.surface,
					},
					labelStyle: [
						styles.buttonLabel,
						{
							color:
								value === opt.value
									? selectedTextColor
									: unselectedTextColor,
						},
					],
				}))}
				theme={{
					roundness: 2,
					colors: {
						secondaryContainer: selectedBackgroundColor,
						onSecondaryContainer: selectedTextColor,
						outline: theme.colors.outlineVariant,
						onSurface: theme.colors.onSurface,
						onSurfaceDisabled: unselectedTextColor,
						surfaceDisabled: theme.colors.surfaceVariant,
					},
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	buttonLabel: {
		fontSize: 14,
		fontWeight: "600",
		paddingVertical: 6,
	},
	grid: {
		width: "100%",
		borderWidth: 1,
		borderRadius: 4,
		flexDirection: "row",
		flexWrap: "wrap",
		overflow: "hidden",
	},
	gridButton: {
		minHeight: 44,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	gridButtonContent: {
		width: "100%",
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	gridButtonIcon: {
		position: "absolute",
		left: 4,
		top: "50%",
		transform: [{ translateY: -10 }],
	},
	gridButtonLabel: {
		width: "100%",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
		paddingHorizontal: 28,
	},
})
