import {
	AccentCard,
	LoadingOverlay,
	ReadOnlyNotice,
	StepList,
	TotalChip,
} from "@components"
import {
	useReadBulkShearingRecords,
	useReadSinglePermit,
	useReadSingleShearingHeader,
} from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button, Icon } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { permitId, permitNumber } = useLocalSearchParams<{
		permitId: string
		permitNumber: string
	}>()
	const { data: permit } = useReadSinglePermit(permitId)
	const isPermitReadOnly = permit?.syncStatus === "synced"
	const { data: shearingForm, loading: loadingShearingHeader } =
		useReadSingleShearingHeader(permitId)
	const { data: shearingRecords, loading: loadingShearingRecords } =
		useReadBulkShearingRecords(permitId)
	const isLoadingScreen = loadingShearingHeader || loadingShearingRecords

	const shearingStepState = shearingForm?.isCompleted ? "done" : "ready"
	const shearingRecordsStepState = shearingRecords.length ? "done" : "ready"

	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
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
										ROUTES.SHEARING.HEADER(
											permitId,
											permitNumber,
										),
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
											source="calendar-range"
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
											{shearingForm.eventDate}
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
											onPress={() =>
												router.push(
													ROUTES.SHEARING.RECORD(
														permitId,
														permitNumber,
														record.id,
													),
												)
											}
											style={{
												backgroundColor:
													theme.colors.surfaceVariant,
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													gap: 12,
													paddingVertical: 6,
												}}
											>
												<View
													style={{
														width: 54,
														flexDirection: "row",
														alignItems: "center",
														gap: 6,
													}}
												>
													<Icon
														source="tag"
														size={18}
														color={
															theme.colors
																.tertiary
														}
													/>
													<Text
														numberOfLines={1}
														style={{
															color: theme.colors
																.tertiary,
															fontWeight: "600",
														}}
													>
														{record.tagNumber}
													</Text>
												</View>
												<View
													style={{
														width: 110,
														flexDirection: "row",
														alignItems: "center",
														gap: 6,
													}}
												>
													<Icon
														source="weight-kilogram"
														size={18}
														color={
															theme.colors
																.tertiary
														}
													/>
													<Text
														numberOfLines={1}
														style={{
															color: theme.colors
																.tertiary,
															fontWeight: "600",
														}}
													>
														{record.liveWeight} kg
													</Text>
												</View>
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
						router.push(
							ROUTES.SHEARING.RECORD(permitId, permitNumber),
						)
					}
				>
					Añadir registro
				</Button>
			</View>
			{isLoadingScreen && (
				<LoadingOverlay message="Cargando registros..." />
			)}
		</SafeAreaView>
	)
}
