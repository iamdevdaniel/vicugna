import { StepList, type StepState } from "@components"
import {
	useReadBulkParticipants,
	useReadBulkShearingRecords,
	useReadSingleBasicInfo,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import {
	getCommunityName,
	getDependentStepState,
	getRegionalName,
} from "@utils/misc"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"

// OVERVIEW /[permitId]
export default function () {
	const theme = useAppTheme()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: basicInfo } = useReadSingleBasicInfo(permitId)
	const { data: participants } = useReadBulkParticipants(permitId)
	const { data: records } = useReadBulkShearingRecords(permitId)

	const basicInfoState: StepState = basicInfo?.isCompleted ? "done" : "ready"
	const participantsState = getDependentStepState(
		basicInfoState === "done",
		participants.length > 0,
	)
	const shearingState = getDependentStepState(
		participantsState === "done",
		records.length > 0,
	)
	const cleaningState = getDependentStepState(shearingState === "done", false)

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen options={{ title: `Permiso ${permitId || ""}` }} />
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
									router.push(ROUTES.BASIC_INFO(permitId)),
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
										ROUTES.PARTICIPANTS.OVERVIEW(permitId),
									),
							},
							details: <Text>Total: {participants.length}</Text>,
						},
						{
							title: "Esquila",
							state: shearingState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.SHEARING.OVERVIEW(permitId),
									),
							},
							details: <Text>Total: {records.length}</Text>,
						},
						{
							title: "Limpieza",
							state: cleaningState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.SHEARING.OVERVIEW(permitId),
									),
							},
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
