import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"
import { Icon } from "react-native-paper"

type ReadOnlyNoticeProps = {
	message?: string
}

export function ReadOnlyNotice({
	message = "Solo lectura",
}: ReadOnlyNoticeProps) {
	const theme = useAppTheme()

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				paddingHorizontal: 12,
				paddingVertical: 10,
				marginBottom: 16,
				borderRadius: 8,
				backgroundColor: theme.colors.custom.yellow,
			}}
		>
			<Icon
				source="lock-outline"
				size={18}
				color={theme.colors.onSurface}
			/>
			<Text
				style={{
					flex: 1,
					fontSize: 13,
					color: theme.colors.onSurface,
				}}
			>
				{message}
			</Text>
		</View>
	)
}
