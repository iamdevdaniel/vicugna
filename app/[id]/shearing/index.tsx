import { StepList } from "@components"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

export default function () {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams<{ id: string }>()

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen options={{ title: `Permiso ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<StepList
					steps={[
						{
							title: "Datos de esquila",
							state: "ready",
							onAction: () =>
								router.push(ROUTES.SHEARING.HEADER(id)),
							details: [],
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
