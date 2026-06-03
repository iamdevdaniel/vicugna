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
import { SegmentedButtons } from "react-native-paper"

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
					disabled ? styles.disabled : undefined,
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
							style={[
								styles.gridButton,
								{
									width: `${100 / columnCount}%`,
									backgroundColor: selected
										? theme.colors.secondary
										: theme.colors.surface,
									borderColor: theme.colors.outlineVariant,
									borderRightWidth: isLastColumn ? 0 : 1,
									borderBottomWidth: isLastRow ? 0 : 1,
								},
							]}
						>
							<Text
								style={[
									styles.gridButtonLabel,
									{
										color: selected
											? theme.colors.onSecondary
											: theme.colors.onSurface,
									},
								]}
							>
								{opt.label}
							</Text>
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
					disabled,
					showSelectedCheck: false,
					style: {
						backgroundColor:
							value === opt.value
								? theme.colors.secondary
								: theme.colors.surface,
					},
					labelStyle: styles.buttonLabel,
				}))}
				theme={{
					roundness: 2,
					colors: {
						secondaryContainer: theme.colors.primary,
						onSecondaryContainer: theme.colors.onPrimary,
						outline: theme.colors.outlineVariant,
						onSurface: theme.colors.onSurface,
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
	disabled: {
		opacity: 0.6,
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
	gridButtonLabel: {
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
})
