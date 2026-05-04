import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import { Text, useTheme } from "react-native-paper"

export default function ShearingDetails() {
	const { shearingId } = useLocalSearchParams()
	const theme = useTheme()

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}
		>
			<Text
				variant="headlineMedium"
				style={{ color: theme.colors.primary }}
			>
				Detalles de Esquila
			</Text>
			<Text
				variant="bodyLarge"
				style={{ marginTop: 10, color: theme.colors.onSurface }}
			>
				ID: {shearingId}
			</Text>
		</View>
	)
}
