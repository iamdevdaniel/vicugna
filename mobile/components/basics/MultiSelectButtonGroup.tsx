import { useAppTheme } from "@utils/useAppTheme"
import {
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
	style?: StyleProp<ViewStyle>
	disabled?: boolean
}

export function MultiSelectButtonGroup({
	value,
	onChange,
	options,
	style,
	disabled = false,
}: MultiSelectButtonGroupProps) {
	const theme = useAppTheme()

	const toggleValue = (optionValue: string) => {
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
						onPress={() => toggleValue(option.value)}
						style={[
							styles.button,
							{
								backgroundColor: selected
									? theme.colors.secondary
									: theme.colors.surface,
								borderColor: selected
									? theme.colors.secondary
									: theme.colors.outlineVariant,
							},
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
									? theme.colors.onSecondary
									: theme.colors.onSurfaceVariant
							}
						/>
						<Text
							style={[
								styles.label,
								{
									color: selected
										? theme.colors.onSecondary
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
		gap: 8,
	},
	button: {
		minHeight: 44,
		flexBasis: "30%",
		flexGrow: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
	disabled: {
		opacity: 0.6,
	},
})
