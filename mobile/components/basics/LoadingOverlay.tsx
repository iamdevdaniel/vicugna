import { useAppTheme } from "@utils/useAppTheme"
import { View } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"

type LoadingOverlayProps = {
	message: string
}

export function LoadingOverlay(props: LoadingOverlayProps) {
	const theme = useAppTheme()

	return (
		<View
			pointerEvents="auto"
			style={{
				position: "absolute",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				alignItems: "center",
				justifyContent: "center",
				paddingHorizontal: 24,
				gap: 12,
				backgroundColor: theme.colors.background,
			}}
		>
			<ActivityIndicator animating size="large" />
			<Text>{props.message}</Text>
		</View>
	)
}
