// import { StepList } from "@components"
// import { useReadOneForm11 } from "@database"
// import { ROUTES } from "@utils/constants"
// import { getCommunityName, getRegionalName } from "@utils/name-lookup"

import { useAppTheme } from "@utils/useAppTheme"
import { Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

// FORM11.OVERVIEW /[id]/form11/[id]
export default function () {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen options={{ title: `Formulario ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			></ScrollView>
		</View>
	)
}
