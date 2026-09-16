import { useAppTheme } from "@utils/useAppTheme"
import type React from "react"
import { StyleSheet, View } from "react-native"
import { Icon, TextInput, type TextInputProps } from "react-native-paper"

type CustomTextInputProps = TextInputProps & {
	rightIcon?: React.ComponentProps<typeof Icon>["source"]
}

export function CustomTextInput({
	style,
	contentStyle,
	rightIcon,
	disabled,
	textColor,
	...props
}: CustomTextInputProps) {
	const theme = useAppTheme()
	const input = (
		<TextInput
			{...props}
			disabled={disabled}
			textColor={
				textColor ??
				(disabled ? theme.colors.onSurfaceVariant : undefined)
			}
			mode="flat"
			style={[style, styles.transparentBackground]}
			contentStyle={[
				contentStyle,
				rightIcon ? styles.contentWithIcon : undefined,
			]}
		/>
	)

	if (!rightIcon) return input

	return (
		<View>
			{input}
			<View pointerEvents="none" style={styles.rightIcon}>
				<Icon
					source={rightIcon}
					size={24}
					color={disabled ? theme.colors.onSurfaceVariant : undefined}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	transparentBackground: {
		backgroundColor: "transparent",
	},
	contentWithIcon: {
		paddingRight: 32,
	},
	rightIcon: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 0,
		justifyContent: "center",
	},
})
