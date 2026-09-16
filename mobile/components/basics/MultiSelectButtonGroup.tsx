import { useAppTheme } from "@utils/useAppTheme"
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

export type MultiSelectOption = {
	label: string
	value: string
}

export type MultiSelectButtonGroupProps = {
	value: string[]
	onChange: (values: string[]) => void
	options: MultiSelectOption[]
	accessibilityLabel?: string
	style?: StyleProp<ViewStyle>
	disabled?: boolean
}

export function MultiSelectButtonGroup({
	value,
	onChange,
	options,
	accessibilityLabel,
	style,
	disabled = false,
}: MultiSelectButtonGroupProps) {
	const theme = useAppTheme()
	const isMultiRow = options.length > 3

	const toggleValue = (optionValue: string) => {
		Keyboard.dismiss()
		onChange(
			value.includes(optionValue)
				? value.filter((selectedValue) => selectedValue !== optionValue)
				: [...value, optionValue],
		)
	}

	return (
		<View
			style={[
				styles.container,
				isMultiRow
					? styles.multiRowContainer
					: styles.singleRowContainer,
				style,
				disabled ? styles.disabled : undefined,
			]}
		>
			{options.map((option) => {
				const selected = value.includes(option.value)

				return (
					<Pressable
						key={option.value}
						disabled={disabled}
						accessibilityRole="checkbox"
						accessibilityLabel={
							accessibilityLabel
								? `${accessibilityLabel}: ${option.label}`
								: option.label
						}
						accessibilityState={{ checked: selected, disabled }}
						accessibilityValue={{
							text: selected ? "Seleccionado" : "No seleccionado",
						}}
						onPress={() => toggleValue(option.value)}
						style={[
							styles.button,
							isMultiRow ? styles.multiRowButton : undefined,
						]}
					>
						<Icon
							source={
								selected
									? "checkbox-marked"
									: "checkbox-blank-outline"
							}
							size={20}
							color={
								selected
									? theme.colors.secondary
									: theme.colors.onSurfaceVariant
							}
						/>
						<Text
							style={[
								styles.label,
								{
									color: selected
										? theme.colors.secondary
										: theme.colors.onSurface,
								},
							]}
						>
							{option.label}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
	},
	singleRowContainer: {
		columnGap: 24,
	},
	multiRowContainer: {
		columnGap: 8,
		rowGap: 0,
	},
	button: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: 6,
		paddingVertical: 8,
	},
	multiRowButton: {
		minHeight: 36,
		flexBasis: "30%",
		flexGrow: 1,
		paddingVertical: 2,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		textAlign: "left",
	},
	disabled: {
		opacity: 0.6,
	},
})
