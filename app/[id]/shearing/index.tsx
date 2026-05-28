import { useAppTheme } from "@utils/useAppTheme"
import { Text, View } from "react-native"

// SHEARING.FORM12.OVERVIEW /[id]/shearing

export default function () {
	const theme = useAppTheme()

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: theme.colors.background,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text style={{ color: theme.colors.onSurface }}>
				Esquila Form 12 Placeholder
			</Text>
		</View>
	)
}
