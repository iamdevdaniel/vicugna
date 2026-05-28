import { StepList } from "@components"
import { useReadBasicInfo, useReadParticipants } from "@database"
import { ROUTES } from "@utils/constants"
import { getCommunityName, getRegionalName } from "@utils/name-lookup"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, View } from "react-native"

// OVERVIEW /[id]
export default function () {
	const theme = useAppTheme()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: basicInfo } = useReadBasicInfo(id)
	const { data: participants } = useReadParticipants(id)

	const basicInfoState = basicInfo?.isCompleted ? "done" : "ready"
	let participantsState: "disabled" | "ready" | "done"
	if (basicInfoState !== "done") {
		participantsState = "disabled"
	} else if (participants.length) {
		participantsState = "done"
	} else {
		participantsState = "ready"
	}

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
							state: basicInfoState,
							onAction: () => router.push(ROUTES.BASIC_INFO(id)),
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
							state: participantsState,
							onAction: () =>
								router.push(ROUTES.PARTICIPANTS.OVERVIEW(id)),
							details: [
								{
									label: "Total",
									value: participants.length.toString(),
								},
							],
						},
						{
							title: "Esquila",
							state: "ready",
							onAction: () =>
								router.push(ROUTES.SHEARING.OVERVIEW(id)),
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
