import {
	AccentCard,
	HeaderBreadcrumb,
	ReadOnlyNotice,
	StepList,
	TotalChip,
} from "@components"
import {
	useReadBulkShearingRecords,
	useReadSinglePermit,
	useReadSingleShearingHeader,
} from "@hooks"
import { useFocusEffect } from "@react-navigation/native"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button, Icon } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId } = useLocalSearchParams<{ permitId: string }>()
	const [openingRecordId, setOpeningRecordId] = useState<string | null>(null)
	const [pressedRecordId, setPressedRecordId] = useState<string | null>(null)
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.isSynced === true
	const permitLabel = permit?.permitNumber ?? "Sin número"
	const { data: shearingForm } = useReadSingleShearingHeader(permitId)
	const { data: shearingRecords } = useReadBulkShearingRecords(permitId)

	const shearingStepState = shearingForm?.isCompleted ? "done" : "ready"
	const shearingRecordsStepState = shearingRecords.length ? "done" : "ready"

	useFocusEffect(
		useCallback(() => {
			setOpeningRecordId(null)
			setPressedRecordId(null)
		}, []),
	)

	const openRecord = (recordId: string) => {
		if (openingRecordId) return

		setOpeningRecordId(recordId)
		router.push(ROUTES.SHEARING.RECORD(permitId, recordId))
	}

	const isRecordBusy = (recordId: string) =>
		pressedRecordId === recordId || openingRecordId === recordId

	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen
				options={{
					headerTitle: () => (
						<HeaderBreadcrumb parts={[permitLabel, "Esquila"]} />
					),
				}}
			/>
			<ScrollView
				contentContainerStyle={{
					paddingTop: 20,
					paddingHorizontal: 20,
					paddingBottom: 25 + insets.bottom,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				{isPermitReadOnly && <ReadOnlyNotice />}
				<StepList
					steps={[
						{
							title: "Información general",
							state: shearingStepState,
							action: {
								icon: "chevron-right",
								onPress: () =>
									router.push(
										ROUTES.SHEARING.HEADER(permitId),
									),
							},
							details: shearingForm?.isCompleted ? (
								<View style={{ gap: 4 }}>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Icon
											source="map-marker"
											size={16}
											color={
												theme.colors.onSurfaceVariant
											}
										/>
										<Text
											style={{
												color: theme.colors
													.onSurfaceVariant,
											}}
										>
											{shearingForm.site}
										</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Icon
											source="clock-outline"
											size={16}
											color={
												theme.colors.onSurfaceVariant
											}
										/>
										<Text
											style={{
												color: theme.colors
													.onSurfaceVariant,
											}}
										>
											{shearingForm.startTime} -{" "}
											{shearingForm.endTime}
										</Text>
									</View>
								</View>
							) : null,
						},
						{
							title: "Registros de esquila",
							state: shearingRecordsStepState,
							details: (
								<View style={{ gap: 8 }}>
									<TotalChip total={shearingRecords.length} />
									{shearingRecords.map((record, index) => (
										<AccentCard
											key={record.id}
											accent={theme.colors.tertiary}
											prefix={index + 1}
											onPressIn={() =>
												setPressedRecordId(record.id)
											}
											onPress={() =>
												openRecord(record.id)
											}
											style={{
												backgroundColor:
													theme.colors.surfaceVariant,
												opacity: isRecordBusy(record.id)
													? 0.7
													: 1,
											}}
										>
											<View
												style={{
													justifyContent: "center",
													paddingVertical: 10,
												}}
											>
												<Text>
													{record.liveWeight} kg
												</Text>
											</View>
										</AccentCard>
									))}
								</View>
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
					padding: 16,
					paddingBottom: 16 + insets.bottom,
					backgroundColor: theme.colors.background,
				}}
			>
				<Button
					mode="contained"
					icon="plus"
					contentStyle={{ height: 48 }}
					disabled={isPermitReadOnly}
					onPress={() =>
						router.push(ROUTES.SHEARING.RECORD(permitId))
					}
				>
					Añadir registro
				</Button>
			</View>
		</SafeAreaView>
	)
}
