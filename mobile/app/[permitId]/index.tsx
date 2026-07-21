import { StepList, type StepState } from "@components"
import {
	useReadBulkCleaningCommon,
	useReadBulkDehearing,
	useReadBulkGrooming,
	useReadBulkParticipants,
	useReadBulkShearingRecords,
	useReadSingleCleaningHeader,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { getDependentStepState } from "@utils/misc"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"

// OVERVIEW /[permitId]
export default function () {
	const theme = useAppTheme()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const { data: participants } = useReadBulkParticipants(permitId)
	const { data: records } = useReadBulkShearingRecords(permitId)
	const { data: cleaningHeader } = useReadSingleCleaningHeader(permitId)
	const { data: cleaningRecords } = useReadBulkCleaningCommon(permitId)
	const cleaningRecordIds = cleaningRecords.map((record) => record.id)
	const { data: groomingRecords } = useReadBulkGrooming(cleaningRecordIds)
	const { data: dehearingRecords } = useReadBulkDehearing(cleaningRecordIds)

	const participantsState: StepState =
		participants.length > 0 ? "done" : "ready"
	const shearingState = getDependentStepState(
		participantsState === "done",
		records.length > 0,
	)
	const completedCleaningRecordIds = new Set([
		...groomingRecords
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
		...dehearingRecords
			.filter((record) => record.isCompleted)
			.map((record) => record.cleaningCommonId),
	])
	const cleaningRecordsCompleted =
		cleaningRecords.length > 0 &&
		cleaningRecords.every((record) =>
			completedCleaningRecordIds.has(record.id),
		)
	const cleaningState = getDependentStepState(
		shearingState === "done",
		cleaningHeader?.isCompleted === true && cleaningRecordsCompleted,
	)

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
										ROUTES.CLEANUP.OVERVIEW(permitId),
									),
							},
							details: (
								<Text>Total: {cleaningRecords.length}</Text>
							),
						},
					]}
				/>
			</ScrollView>
		</View>
	)
}
