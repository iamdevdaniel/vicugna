import { AccentCard, StepList } from "@components"
import { useReadBulkShearingRecords, useReadSingleShearingHeader } from "@hooks"
import { ROUTES } from "@utils/constants"
import { useAppTheme } from "@utils/useAppTheme"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { Button, IconButton } from "react-native-paper"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function () {
	const theme = useAppTheme()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { data: shearingForm } = useReadSingleShearingHeader(id)
	const { data: shearingRecords } = useReadBulkShearingRecords(id)

	const shearingStepState = shearingForm?.isCompleted ? "done" : "ready"
	const shearingRecordsStepState = shearingRecords.length ? "done" : "ready"

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: theme.colors.background }}
		>
			<Stack.Screen options={{ title: `Permiso ${id || ""}` }} />
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					backgroundColor: "transparent",
				}}
				style={{ flex: 1 }}
			>
				<StepList
					steps={[
						{
							title: "Datos de esquila",
							state: shearingStepState,
							action: {
								icon: "pencil",
								onPress: () =>
									router.push(ROUTES.SHEARING.HEADER(id)),
							},
						},
						{
							title: "Registros de esquila",
							state: shearingRecordsStepState,
							details: (
								<View style={{ gap: 8 }}>
									<Text>Total: {shearingRecords.length}</Text>
									{shearingRecords.map((record, index) => (
										<AccentCard
											key={record.id}
											accent={theme.colors.custom.green}
											prefix={index + 1}
											style={{
												backgroundColor:
													theme.colors.surfaceVariant,
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													paddingRight: 4,
													paddingVertical: 6,
												}}
											>
												<View style={{ flex: 1 }}>
													<Text>
														{record.liveWeight} kg
													</Text>
												</View>
												<IconButton
													icon="pencil"
													size={18}
													iconColor={
														theme.colors.custom
															.green
													}
													onPress={() =>
														router.push(
															ROUTES.SHEARING.RECORD(
																id,
																record.id,
															),
														)
													}
													style={{ margin: 0 }}
												/>
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
					onPress={() => router.push(ROUTES.SHEARING.RECORD(id))}
				>
					Añadir registro
				</Button>
			</View>
		</SafeAreaView>
	)
}
