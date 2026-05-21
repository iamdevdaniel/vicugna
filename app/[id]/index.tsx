import { StepList } from "@components"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

// Route: /[id]
export default function AdminPermitDetail() {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams()

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
							title: "Informacion Básica",
							state: "ready",
							onAction: () =>
								router.push(ROUTES.BASIC_INFO(id as string)),
						},
						{
							title: "Participantes",
							state: "ready",
							onAction: () => {},
						},
						{
							title: "Esquila",
							state: "ready",
							onAction: () => {},
						},
						{
							title: "Limpieza",
							state: "ready",
							onAction: () => {},
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
