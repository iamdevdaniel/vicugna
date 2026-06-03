import { StepList } from "@components"
import { useReadBasicInfo, useReadParticipants } from "@database"
import { ROUTES } from "@utils/constants"
import { getCommunityName, getRegionalName } from "@utils/name-lookup"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"

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
							title: "Informacion Basica",
							state: basicInfoState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(ROUTES.BASIC_INFO(id)),
							},
							details: basicInfo?.isCompleted ? (
								<View style={{ gap: 4 }}>
									<Text>Fecha: {basicInfo.date}</Text>
									<Text>
										Regional: {getRegionalName(basicInfo)}
									</Text>
									<Text>
										Comunidad: {getCommunityName(basicInfo)}
									</Text>
								</View>
							) : null,
						},
						{
							title: "Participantes",
							state: participantsState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.PARTICIPANTS.OVERVIEW(id),
									),
							},
							details: <Text>Total: {participants.length}</Text>,
						},
						{
							title: "Esquila",
							state: "ready",
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(ROUTES.SHEARING.OVERVIEW(id)),
							},
						},
						{
							title: "Limpieza",
							state: "ready",
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
