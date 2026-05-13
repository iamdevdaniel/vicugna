import { useAppTheme } from "@utils/useAppTheme"
import { Pressable, Text, View } from "react-native"

export const OverviewStep = ({
	number,
	title,
	onPress,
	disabled = false,
}: {
	number: number
	title: string
	onPress: () => void
	disabled?: boolean
}) => {
	const theme = useAppTheme()
	return (
		<Pressable
			onPress={disabled ? undefined : onPress}
			style={{
				flexDirection: "row",
				alignItems: "center",
				backgroundColor: theme.colors.surface,
				padding: 16,
				borderRadius: 12,
				marginBottom: 12,
				borderWidth: 1,
				borderColor: theme.colors.outlineVariant,
				opacity: disabled ? 0.4 : 1,
			}}
		>
			<View
				style={{
					backgroundColor: disabled
						? theme.colors.onSurfaceVariant
						: theme.colors.custom.green,
					width: 32,
					height: 32,
					borderRadius: 4,
					justifyContent: "center",
					alignItems: "center",
					marginRight: 16,
				}}
			>
				<Text
					style={{
						color: theme.colors.custom.white,
						fontSize: 16,
						fontWeight: "bold",
					}}
				>
					{number}
				</Text>
			</View>
			<Text
				style={{
					fontSize: 16,
					fontWeight: "bold",
					color: disabled
						? theme.colors.onSurfaceVariant
						: theme.colors.onSurface,
					flex: 1,
				}}
			>
				{title}
			</Text>
		</Pressable>
	)
}
