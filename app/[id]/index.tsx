import { StepList } from "@components"
import { useReadBasicInfo } from "@database"
import { ROUTES } from "@utils/constants"
import { getCommunityName, getRegionalName } from "@utils/name-lookup"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

// Route: /[id]
export default function AdminPermitDetail() {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: basicInfo } = useReadBasicInfo(id)

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
							state: basicInfo?.isCompleted ? "done" : "ready",
							onAction: () =>
								router.push(ROUTES.BASIC_INFO(id as string)),
							details: basicInfo?.isCompleted
								? [
										{
											label: "Fecha",
											value: basicInfo.fechaCaptura,
										},
										{
											label: "Regional",
											value: getRegionalName(basicInfo),
										},
										{
											label: "Comunidad",
											value: getCommunityName(basicInfo),
										},
									]
								: [],
						},
						{
							title: "Participantes",
							state: "ready",
							onAction: () => {},
							details: [],
						},
						{
							title: "Esquila",
							state: "ready",
							onAction: () => {},
							details: [],
						},
						{
							title: "Limpieza",
							state: "ready",
							onAction: () => {},
							details: [],
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
