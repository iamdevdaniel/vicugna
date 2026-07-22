import { StepList, type StepState, TotalChip } from "@components"
import {
	useReadBulkCleaningCommon,
	useReadBulkDehearing,
	useReadBulkGrooming,
	useReadBulkParticipants,
	useReadBulkShearingRecords,
	useReadPermits,
	useReadSingleCleaningHeader,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { getDependentStepState } from "@utils/misc"
import { getCommunityName } from "@utils/regionals"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button, Icon } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

// OVERVIEW /[permitId]
export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId, permitNumber } = useLocalSearchParams<{
		permitId: string
		permitNumber?: string
	}>()
	const { data: permits } = useReadPermits()
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
	const permit = permits.find((item) => item.id === permitId)
	const communityName = permit
		? getCommunityName(permit.communityId)
		: "Comunidad"

	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen
				options={{
					headerTitle: () => (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 10,
								flex: 1,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 8,
									flexShrink: 1,
								}}
							>
								<Icon
									source="file-key"
									size={18}
									color={theme.colors.onSurface}
								/>
								<Text
									style={{
										fontSize: 16,
										fontWeight: "700",
										color: theme.colors.onSurface,
										flexShrink: 1,
									}}
									numberOfLines={1}
								>
									{permitNumber ?? "Sin número"}
								</Text>
							</View>
							<Text
								style={{
									fontSize: 12,
									fontWeight: "500",
									color: theme.colors.onSurfaceVariant,
									flexShrink: 1,
									textAlign: "right",
								}}
								numberOfLines={1}
							>
								{communityName}
							</Text>
						</View>
					),
				}}
			/>
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					paddingBottom: 140 + insets.bottom,
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
										ROUTES.PARTICIPANTS.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: <TotalChip total={participants.length} />,
						},
						{
							title: "Esquila",
							state: shearingState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.SHEARING.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: <TotalChip total={records.length} />,
						},
						{
							title: "Limpieza",
							state: cleaningState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(
										ROUTES.CLEANUP.OVERVIEW({
											permitId,
											permitNumber,
										}),
									),
							},
							details: (
								<TotalChip total={cleaningRecords.length} />
							),
						},
					]}
				/>
			</ScrollView>
			<View
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					paddingHorizontal: 16,
					paddingTop: 10,
					paddingBottom: 16 + insets.bottom,
					backgroundColor: theme.colors.background,
					borderTopWidth: 1,
					borderTopColor: theme.colors.surfaceVariant,
					gap: 10,
				}}
			>
				<Text
					style={{
						fontSize: 12,
						color: theme.colors.onSurfaceVariant,
						textAlign: "center",
					}}
				>
					Finaliza este permiso cuando ya no queden cambios por hacer.
				</Text>
				<Button
					mode="contained"
					icon="cloud-upload"
					contentStyle={{ height: 48 }}
					buttonColor={theme.colors.custom.green}
					textColor={theme.colors.custom.white}
					onPress={() => {}}
				>
					Finalizar y enviar
				</Button>
			</View>
		</SafeAreaView>
	)
}
